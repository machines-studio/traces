import Config from '/controllers/Config'
import createReverb from '/utils/audio-reverb'

// AudioContext singleton
let ctx = null

function getCtx () {
  if (!ctx || ctx.state === 'closed') {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// Melody definition
// Each note: [timeOffset (s), frequency (Hz), duration (s), gain (0–1)]
// Loops every LOOP_DURATION seconds

// D Dorian: D2–A3
const SCALE = [
  73.42,  // D2
  82.41,  // E2
  87.31,  // F2
  98.00,  // G2
  110.00, // A2
  123.47, // B2
  130.81, // C3
  146.83, // D3
  164.81, // E3
  174.61, // F3
  220.00  // A3
]

// Base layer — melodic, grave, with phrases arcing from motif to resolution
const NOTES = [
  // phrase 1 — opening motif: D→A→G→A→D (question, lands back home) (0–22s)
  [0.0,  SCALE[0], 4.0, 0.30],   // D2  — root, anchor
  [4.5,  SCALE[4], 3.5, 0.26],   // A2  — fifth, lift
  [8.5,  SCALE[3], 2.5, 0.22],   // G2  — step down
  [11.5, SCALE[4], 2.0, 0.24],   // A2  — return
  [14.0, SCALE[7], 4.5, 0.28],   // D3  — octave resolution, held

  // phrase 2 — response: B→A→G→E→D (descent, settling) (24–42s)
  [24.0, SCALE[5], 3.0, 0.26],   // B2  — slightly tense
  [27.5, SCALE[4], 2.5, 0.24],   // A2
  [30.5, SCALE[3], 2.0, 0.22],   // G2
  [33.0, SCALE[1], 3.5, 0.26],   // E2  — falling
  [37.0, SCALE[0], 5.0, 0.30],   // D2  — resolves to root, long hold

  // phrase 3 — variation: D→F→A→C→B→A (colour note F adds warmth) (44–62s)
  [44.0, SCALE[0], 2.5, 0.28],   // D2
  [47.0, SCALE[2], 2.0, 0.24],   // F2  — Dorian colour note
  [49.5, SCALE[4], 3.0, 0.28],   // A2
  [53.0, SCALE[6], 2.5, 0.24],   // C3  — floating
  [56.0, SCALE[5], 2.0, 0.22],   // B2  — tension
  [58.5, SCALE[4], 4.0, 0.26],   // A2  — gentle resolution

  // phrase 4 — high arc: D3→E3→D3→B2→G2→D2 (peak then long descent) (64–84s)
  [64.0, SCALE[7], 3.0, 0.30],   // D3  — starts high
  [67.5, SCALE[8], 2.5, 0.26],   // E3  — peak
  [70.5, SCALE[7], 2.0, 0.24],   // D3  — step back
  [73.0, SCALE[5], 3.0, 0.26],   // B2
  [76.5, SCALE[3], 3.5, 0.24],   // G2  — stepping down
  [80.5, SCALE[0], 5.0, 0.32],   // D2  — root, long breath

  // phrase 5 — reprise of opening motif, slower, fades into loop (87–119s)
  [87.0,  SCALE[0], 4.5, 0.28],  // D2
  [92.0,  SCALE[4], 4.0, 0.24],  // A2
  [96.5,  SCALE[3], 3.0, 0.22],  // G2
  [100.0, SCALE[5], 3.5, 0.24],  // B2  — slight variant vs phrase 1
  [104.0, SCALE[7], 4.5, 0.26],  // D3
  [109.0, SCALE[4], 3.5, 0.22],  // A2  — descend
  [113.0, SCALE[0], 8.0, 0.28]   // D2  — long held root, breathes into loop
]

// Aerial accents — triangle wave, highpass, reverberant, sparse; same scale 2–3 octaves up
const ACCENTS = [
  [11.5,  SCALE[7] * 4, 3.5, 0.09],  // after phrase 1 climax
  [38.5,  SCALE[4] * 4, 4.0, 0.07],  // end of phrase 2
  [57.5,  SCALE[9] * 2, 5.0, 0.08],  // after phrase 3 peak
  [76.5,  SCALE[0] * 4, 4.5, 0.08],  // end of phrase 4
  [93.5,  SCALE[5] * 4, 3.5, 0.07],  // mid phrase 5
  [113.5, SCALE[7] * 4, 6.0, 0.09]   // final shimmer into loop
]

const LOOP_DURATION = 120 // seconds

// Node graph
let masterGain = null
let reverbNodes = null
let lookaheadTimer = null
let loopStart = null  // AudioContext time when loop began
let running = false

// Ramp a GainNode to avoid clicks
function fadeTo (gainNode, value, duration) {
  const audioCtx = getCtx()
  gainNode.gain.cancelScheduledValues(audioCtx.currentTime)
  gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime)
  gainNode.gain.linearRampToValueAtTime(value, audioCtx.currentTime + duration)
}

// Schedule one melody note
function scheduleNote (audioCtx, freq, startTime, duration, noteGain) {
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  const filter = audioCtx.createBiquadFilter()

  osc.type = Config.AMBIENCE.waveform
  osc.frequency.value = freq

  // Slight sub-octave detuning for warmth
  osc.detune.value = -4

  filter.type = 'lowpass'
  filter.frequency.value = Config.AMBIENCE.filterFrequency
  filter.Q.value = 0.7

  // Envelope: fade in → sustain → fade out
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.linearRampToValueAtTime(noteGain, startTime + Config.AMBIENCE.attack)
  gain.gain.setValueAtTime(noteGain, startTime + duration - Config.AMBIENCE.release)
  gain.gain.linearRampToValueAtTime(0.0001, startTime + duration)

  osc.connect(filter)
  filter.connect(gain)

  if (reverbNodes) {
    gain.connect(reverbNodes.dryGain)
    gain.connect(reverbNodes.convolver)
    reverbNodes.convolver.connect(reverbNodes.wetGain)
    reverbNodes.dryGain.connect(masterGain)
    reverbNodes.wetGain.connect(masterGain)
  } else {
    gain.connect(masterGain)
  }

  masterGain.connect(audioCtx.destination)

  osc.start(startTime)
  osc.stop(startTime + duration + 0.05)
}

// Schedule one aerial accent — long reverb tail
function scheduleAccent (audioCtx, freq, startTime, duration, noteGain) {
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  const filter = audioCtx.createBiquadFilter()
  const accentReverb = createReverb(audioCtx, 6.0, 0.85)

  osc.type = 'triangle'
  osc.frequency.value = freq
  osc.detune.value = 8  // slight sharp detune — ethereal

  filter.type = 'highpass'
  filter.frequency.value = 1200
  filter.Q.value = 0.5

  // Slow attack, long release — floats in and out
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.linearRampToValueAtTime(noteGain, startTime + 1.5)
  gain.gain.setValueAtTime(noteGain, startTime + duration - 2.0)
  gain.gain.linearRampToValueAtTime(0.0001, startTime + duration)

  osc.connect(filter)
  filter.connect(gain)

  gain.connect(accentReverb.dryGain)
  gain.connect(accentReverb.convolver)
  accentReverb.convolver.connect(accentReverb.wetGain)
  accentReverb.dryGain.connect(masterGain)
  accentReverb.wetGain.connect(masterGain)

  osc.start(startTime)
  osc.stop(startTime + duration + 0.1)
}

// Schedule notes and accents for one loop cycle starting at `cycleStart`
function scheduleCycle (audioCtx, cycleStart) {
  for (const [offset, freq, dur, gain] of NOTES) {
    scheduleNote(audioCtx, freq, cycleStart + offset, dur, gain)
  }
  for (const [offset, freq, dur, gain] of ACCENTS) {
    scheduleAccent(audioCtx, freq, cycleStart + offset, dur, gain)
  }
}

// Lookahead scheduler — schedules the next cycle 5s before loop end
function tick () {
  if (!running) return
  const audioCtx = getCtx()

  if (masterGain === null) {
    masterGain = audioCtx.createGain()
    masterGain.gain.value = Config.AMBIENCE.volume
    masterGain.connect(audioCtx.destination)
  }

  if (reverbNodes === null) {
    reverbNodes = createReverb(audioCtx, Config.AMBIENCE.reverbDuration, Config.AMBIENCE.reverbMix)
  }

  const now = audioCtx.currentTime
  const elapsed = now - loopStart
  const cyclesElapsed = Math.floor(elapsed / LOOP_DURATION)
  const nextCycleStart = loopStart + (cyclesElapsed + 1) * LOOP_DURATION
  const timeUntilNextCycle = nextCycleStart - now

  if (timeUntilNextCycle < 5) {
    scheduleCycle(audioCtx, nextCycleStart)
  }

  lookaheadTimer = setTimeout(tick, 4000)
}

// Public API

export function start () {
  if (running) return
  running = true

  const audioCtx = getCtx()

  masterGain = audioCtx.createGain()
  masterGain.gain.value = 0.0001
  masterGain.connect(audioCtx.destination)

  reverbNodes = createReverb(audioCtx, Config.AMBIENCE.reverbDuration, Config.AMBIENCE.reverbMix)

  loopStart = audioCtx.currentTime
  scheduleCycle(audioCtx, loopStart)
  fadeTo(masterGain, Config.AMBIENCE.volume, Config.AMBIENCE.fadeTime)

  lookaheadTimer = setTimeout(tick, 4000)
}

export function stop (fadeOut = Config.AMBIENCE.fadeTime) {
  if (!running) return
  running = false

  clearTimeout(lookaheadTimer)
  lookaheadTimer = null

  if (masterGain) {
    fadeTo(masterGain, 0, fadeOut)
    // Disconnect after fade
    setTimeout(() => {
      masterGain?.disconnect()
      masterGain = null
      reverbNodes = null
    }, (fadeOut + 0.1) * 1000)
  }
}

export function setVolume (value, fadeTime = Config.AMBIENCE.fadeTime) {
  if (!masterGain) return
  fadeTo(masterGain, value, fadeTime)
}

export default { start, stop, setVolume }
