import './Recorder.scss'
import { Component } from '@tooooools/ui'
import { Button } from '@tooooools/ui/components'
import { $ } from '@tooooools/ui/state'

import AudioRecorder from '/abstractions/AudioRecorder'
import * as Icons from '/data/icons'
import Ambience from '/controllers/Ambience'
import API from '/controllers/API'
import Config, { DEBUG } from '/controllers/Config'
import Voice from '/controllers/Voice'
import delay from '/utils/delay'
import morse from '/utils/string-morse'

export default class Recorder extends Component {
  #recorder = new AudioRecorder()

  $transcript = $(null)
  $transcripting = $(false)
  get $recording () { return this.#recorder.$recording }

  template () {
    return (
      <Button
        class={['recorder', {
          'is-recording': this.#recorder.$recording,
          'is-transcripting': this.$transcripting
        }]}
        icon={$(this.#recorder.$recording, recording => recording ? Icons.record : Icons.a)}
        event-click={this.#handleClick}
        style={{
          '--recorder-progress': $(this.#recorder.$duration, duration => (duration / Config.RECORDER.maxDuration).toFixed(2)),
          '--recorder-microphone-level': $(this.#recorder.$level, level => level.toFixed(2))
        }}
      >
        <div class='recorder__progress' />
        <div class='recorder__morse'>
          <span innerHTML={morse()} />
        </div>
      </Button>
    )
  }

  async afterRender () {
    this.watch(this.#recorder.$duration, this.#handleDuration)
    await this.#recorder.init()
  }

  #handleClick = async e => {
    // Start recording
    if (!this.$recording.value) {
      Voice.stop()
      Ambience.setVolume(0, 0.5)
      return this.#recorder.start()
    }

    // End recording and fetch transcript
    this.$transcripting.value = true
    try {
      Ambience.setVolume(Config.AMBIENCE.volume)

      await this.#recorder.stop()
      const blob = await this.#recorder.toBlob('wav')

      // Playback sound
      if (DEBUG.includes('recorder')) new Audio(URL.createObjectURL(blob)).play()

      // Transcript recording
      const [transcript] = await Promise.all([
        await API.fetchTranscript(blob),
        delay(3_000), // At least a little bit of this awesome animation :)
      ])

      this.$transcript.value = transcript
    } finally {
      this.$transcripting.value = false
      this.#recorder.reset()
    }
  }

  #handleDuration = duration => {
    if (duration >= Config.RECORDER.maxDuration) this.#handleClick()
  }

  beforeDestroy () {
    this.#recorder.destroy()
  }
}
