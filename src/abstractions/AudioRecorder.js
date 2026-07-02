import { raf } from '@internet/raf'
import { $ } from '@tooooools/ui/state'

import audioBufferToWav from '/utils/audio-buffer-to-wav'

export default class AudioRecorder {
  $ready = $(false)
  $recording = $(false)

  $level = $(0) // RMS volume of the input stream, from 0 to 1
  $duration = $(0)

  chunks = []
  mediaRecorder
  audioContext
  analyser
  analyserBuffer

  constructor () {
    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error('getUserMedia not supported')
    }
  }

  async init (stream = undefined, { force = false } = {}) {
    if (this.$ready.value && !force) return

    stream ??= await navigator.mediaDevices.getUserMedia({ audio: true })
    this.mediaRecorder = new MediaRecorder(stream)
    this.mediaRecorder.ondataavailable = e => this.chunks.push(e.data)

    this.audioContext = new AudioContext()
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 256
    this.analyserBuffer = new Uint8Array(this.analyser.frequencyBinCount)
    this.audioContext.createMediaStreamSource(stream).connect(this.analyser)

    this.$ready.value = true
  }

  tick = dt => {
    if (!this.$recording.value) return
    this.$duration.value += dt

    this.analyser.getByteTimeDomainData(this.analyserBuffer)
    const rms = Math.sqrt(
      this.analyserBuffer.reduce((sum, value) => sum + ((value - 128) / 128) ** 2, 0) / this.analyserBuffer.length
    )
    this.$level.value = Math.min(1, rms * 4) // scale up, RMS of speech rarely nears 1
  }

  start () {
    if (this.$recording.value) return

    this.chunks.length = 0
    this.$duration.value = 0
    this.$recording.value = true
    this.mediaRecorder.start()
    raf.add(this.tick)
  }

  // Stop recording; resolves once the recorder has flushed its last chunk
  stop = () => new Promise(resolve => {
    this.mediaRecorder.onstop = () => {
      this.$recording.value = false
      resolve()
    }

    this.mediaRecorder.stop()
    raf.remove(this.tick)
  })

  // Must be called after stop() has resolved
  async toBlob (format = 'ogg') {
    const oggBlob = new Blob(this.chunks, { type: 'audio/ogg; codecs=opus' })
    if (format === 'ogg') return oggBlob

    const audioBuffer = await this.audioContext.decodeAudioData(await oggBlob.arrayBuffer())
    return audioBufferToWav(audioBuffer)
  }

  reset () {
    if (this.$recording.value) this.mediaRecorder.stop()
    raf.remove(this.tick)

    this.$level.reset()
    this.$duration.reset()
    this.$recording.reset()
    this.chunks.length = 0
  }

  // Release the microphone and audio graph; call when the recorder is no longer needed
  destroy () {
    this.reset()
    this.mediaRecorder?.stream.getTracks().forEach(track => track.stop())
    this.audioContext?.close()
    this.$ready.reset()
  }
}
