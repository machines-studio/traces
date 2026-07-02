// Builds a short reverb impulse response via noise decay
export default function createReverb (ctx, duration, mix) {
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
