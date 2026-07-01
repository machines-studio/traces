import Config from './Config'

function resolvePreset (name) {
  const preset = Config.VOICES?.presets?.[name] ?? {}
  if (preset.extends) return { ...resolvePreset(preset.extends), ...preset }
  return preset
}

function resolveOptions (presetOrOptions = {}) {
  const defaults = Config.VOICES?.defaults ?? {}
  if (typeof presetOrOptions === 'string') {
    return { ...defaults, ...resolvePreset(presetOrOptions) }
  }
  return { ...defaults, ...presetOrOptions }
}

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

function scheduleBlip (ctx, freq, dur, when, reverbNodes, opts) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()

  filter.type = 'lowpass'
  filter.frequency.value = opts.filterFrequency

  // 'sine' = round/soft, 'triangle' = slightly warmer, 'sawtooth' = harsh/bright
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, when)
  // Pitch drops over the blip duration for a percussive feel
  osc.frequency.linearRampToValueAtTime(freq * opts.blipPitchDrop, when + dur)

  gain.gain.setValueAtTime(0.0001, when)
  gain.gain.linearRampToValueAtTime(opts.blipGain, when + dur * 0.15)
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

let ctx = null

export function stop () {
  ctx?.close()
  ctx = null
}

export function speak (phrase = '', presetOrOptions = {}) {
  stop()
  if (!phrase.length) return

  const opts = resolveOptions(presetOrOptions)

  ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()

  const blips = Math.max(1, Math.round(opts.blipsPerWord))
  const reverbNodes = opts.reverbDuration > 0 && opts.reverbMix > 0
    ? createReverb(ctx, opts.reverbDuration, opts.reverbMix)
    : null

  let t = ctx.currentTime + 0.05
  let letterIndex = 0

  for (const ch of phrase) {
    if (ch === ' ') {
      t += opts.stepMs / 1000 * opts.wordGapMultiplier
      letterIndex = 0
      continue
    }
    if (!/[a-zA-Z]/.test(ch)) continue

    // Only play a blip every N letters
    if (letterIndex % blips === 0) {
      const freq = charFreq(ch, opts.pitch)
      const dur = (opts.stepMs / 1000) * 0.9
      scheduleBlip(ctx, freq, dur, t, reverbNodes, opts)
    }

    t += opts.stepMs / 1000
    letterIndex++
  }
}

export default { speak, stop }
