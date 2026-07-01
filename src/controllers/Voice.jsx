import Config from './Config'

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
  filter.frequency.value = Config.VOICES.filterFrequency ?? 900

  // 'sine' = round/soft, 'triangle' = slightly warmer, 'sawtooth' = harsh/bright
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, when)
  // Pitch drops over the blip duration for a percussive feel
  osc.frequency.linearRampToValueAtTime(freq * (Config.VOICES.blipPitchDrop ?? 0.55), when + dur)

  gain.gain.setValueAtTime(0.0001, when)
  gain.gain.linearRampToValueAtTime(Config.VOICES.blipGain ?? 0.3, when + dur * 0.15)
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

export function speak (phrase = '', {
  pitch = Config.VOICES.pitch ?? 1.5,
  speed = Config.VOICES.stepMs ?? 25,
  blipsPerWord = Config.VOICES.blipsPerWord ?? 5,
  reverbDuration = Config.VOICES.reverbDuration ?? 0.8,
  reverbMix = Config.VOICES.reverbMix ?? 0.5
} = {}) {
  stop()
  if (!phrase.length) return

  ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()

  const blips = Math.max(1, Math.round(blipsPerWord))
  const reverbNodes = reverbDuration > 0 && reverbMix > 0
    ? createReverb(ctx, reverbDuration, reverbMix)
    : null

  let t = ctx.currentTime + 0.05
  let letterIndex = 0

  for (const ch of phrase) {
    if (ch === ' ') {
      t += speed / 1000 * (Config.VOICES.wordGapMultiplier ?? 1.4)
      letterIndex = 0
      continue
    }
    if (!/[a-zA-Z]/.test(ch)) continue

    // Only play a blip every N letters
    if (letterIndex % blips === 0) {
      const freq = charFreq(ch, pitch)
      const dur = (speed / 1000) * 0.9
      scheduleBlip(ctx, freq, dur, t, reverbNodes)
    }

    t += speed / 1000
    letterIndex++
  }
}

export default { speak, stop }
