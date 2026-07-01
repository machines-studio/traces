import { Component, Props } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'

// --- Tweak these constants to change the default sound ---

// Voice pitch multiplier. Below 1.0 = deep, above 1.6 = high-pitched.
const DEFAULT_PITCH = 1.5

// Duration of each character blip in milliseconds. Lower = faster speech.
const DEFAULT_STEP_MS = 25

// How many blips are played per word. 1 = one blip per letter (full word).
// 2 = only every other letter, 3 = every third, etc. Higher = sparser, faster feel.
const DEFAULT_BLIPS_PER_WORD = 5

// Reverb: length of the impulse response in seconds. 0 = no reverb.
const DEFAULT_REVERB_DURATION = 0.8

// Reverb: dry/wet mix. 0 = fully dry, 1 = fully wet.
const DEFAULT_REVERB_MIX = 0.5

// Lowpass filter cutoff in Hz. Lower = more muffled voice.
const FILTER_FREQUENCY = 900

// Peak gain per blip (0–1). Lower = quieter.
const BLIP_GAIN = 0.3

// How fast the pitch drops during a blip (ratio). 0.42 = drops to 42% of start freq.
// Values below 1.0 = pitch falls (soft landing). Above 1.0 = pitch rises (harsh).
const BLIP_PITCH_DROP = 0.55

// Extra silence added between words, as a multiplier of step duration.
const WORD_GAP_MULTIPLIER = 1.4

// --- Internal helpers ---

function charFreq (ch, basePitch) {
  const code = ch.toLowerCase().charCodeAt(0)
  // Vowels sit in a lower frequency range than consonants for a more natural feel
  const base = 'aeiouy'.includes(ch.toLowerCase()) ? 260 : 340
  // Deterministic variation per character so each letter has its own pitch
  const variation = (code % 13) * 30
  return (base + variation) * basePitch
}

// Builds a short reverb impulse response via noise decay
function createReverb (ctx, duration, mix) {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * duration
  const impulse = ctx.createBuffer(2, length, sampleRate)
  for (let c = 0; c < 2; c++) {
    const data = impulse.getChannelData(c)
    for (let i = 0; i < length; i++) {
      // White noise decaying exponentially over the duration
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2)
    }
  }

  const convolver = ctx.createConvolver()
  convolver.buffer = impulse

  // Dry/wet mix: dryGain passes the original signal, wetGain passes reverb
  const dryGain = ctx.createGain()
  const wetGain = ctx.createGain()
  dryGain.gain.value = 1 - mix
  wetGain.gain.value = mix

  return { convolver, dryGain, wetGain }
}

function scheduleBlip (ctx, freq, dur, when, reverbNodes) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()

  filter.type = 'lowpass'
  filter.frequency.value = FILTER_FREQUENCY

  // 'sine' = round/soft, 'triangle' = slightly warmer, 'sawtooth' = harsh/bright
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, when)
  // Pitch drops over the blip duration for a percussive feel
  osc.frequency.linearRampToValueAtTime(freq * BLIP_PITCH_DROP, when + dur)

  gain.gain.setValueAtTime(0.0001, when)
  gain.gain.linearRampToValueAtTime(BLIP_GAIN, when + dur * 0.15)
  gain.gain.exponentialRampToValueAtTime(0.0001, when + dur)

  osc.connect(filter)
  filter.connect(gain)

  if (reverbNodes) {
    // Split signal into dry and wet paths
    gain.connect(reverbNodes.dryGain)
    gain.connect(reverbNodes.convolver)
    reverbNodes.convolver.connect(reverbNodes.wetGain)
    reverbNodes.dryGain.connect(ctx.destination)
    reverbNodes.wetGain.connect(ctx.destination)
  } else {
    gain.connect(ctx.destination)
  }

  osc.start(when)
  osc.stop(when + dur + 0.02)
}

export default class Voices extends Component {
  static props = {
    phrase: [Props.string, Props.Signal],
    // Voice pitch multiplier (see DEFAULT_PITCH)
    pitch: [Props.number, Props.Signal],
    // Character blip duration in ms (see DEFAULT_STEP_MS)
    speed: [Props.number, Props.Signal],
    // Play 1 blip every N letters (see DEFAULT_BLIPS_PER_WORD)
    blipsPerWord: [Props.number, Props.Signal],
    // Reverb duration in seconds (see DEFAULT_REVERB_DURATION)
    reverbDuration: [Props.number, Props.Signal],
    // Reverb dry/wet mix 0–1 (see DEFAULT_REVERB_MIX)
    reverbMix: [Props.number, Props.Signal]
  }

  $phrase = $(this.props.phrase ?? '')
  $pitch = $(this.props.pitch ?? DEFAULT_PITCH)
  $speed = $(this.props.speed ?? DEFAULT_STEP_MS)
  $blipsPerWord = $(this.props.blipsPerWord ?? DEFAULT_BLIPS_PER_WORD)
  $reverbDuration = $(this.props.reverbDuration ?? DEFAULT_REVERB_DURATION)
  $reverbMix = $(this.props.reverbMix ?? DEFAULT_REVERB_MIX)

  #ctx = null

  speak (phrase) {
    this.#stop()

    this.#ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (this.#ctx.state === 'suspended') this.#ctx.resume()

    const basePitch = this.$pitch.value
    const stepMs = this.$speed.value
    const blipsPerWord = Math.max(1, Math.round(this.$blipsPerWord.value))
    const reverbDuration = this.$reverbDuration.value
    const reverbMix = this.$reverbMix.value

    const reverbNodes = reverbDuration > 0 && reverbMix > 0
      ? createReverb(this.#ctx, reverbDuration, reverbMix)
      : null

    let t = this.#ctx.currentTime + 0.05
    let letterIndex = 0 // tracks position within the current word

    for (const ch of (phrase ?? this.$phrase.value)) {
      if (ch === ' ') {
        t += stepMs / 1000 * WORD_GAP_MULTIPLIER
        letterIndex = 0 // reset on new word
        continue
      }
      if (!/[a-zA-Z]/.test(ch)) continue

      // Only play a blip every N letters
      if (letterIndex % blipsPerWord === 0) {
        const freq = charFreq(ch, basePitch)
        const dur = (stepMs / 1000) * 0.9
        scheduleBlip(this.#ctx, freq, dur, t, reverbNodes)
      }

      t += stepMs / 1000
      letterIndex++
    }
  }

  #stop () {
    if (this.#ctx) {
      this.#ctx.close()
      this.#ctx = null
    }
  }

  afterMount () {
    this.watch(this.$phrase, phrase => {
      if (phrase) this.speak(phrase)
    })
  }

  beforeDestroy () {
    this.#stop()
  }

  template () {
    return null
  }
}
