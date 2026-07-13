import './Recorder.scss'
import { Component } from '@tooooools/ui'
import { Button } from '@tooooools/ui/components'
import { $ } from '@tooooools/ui/state'

import * as Icons from '/data/icons'
import morse from '/utils/string-morse'

export default class Recorder extends Component {
  $recording = $(false)
  $transcripting = $(false)

  $transcript = $(null)

  template () {
    return (
      <Button
        class={['recorder', { 'is-recording': this.$recording }]}
        waiting={this.$transcripting}
        icon={$(this.$recording, recording => recording ? Icons.record : Icons.a)}
        event-click={this.#handleClick}
      >
        <div class='recorder__morse'>
          <span innerHTML={morse()} />
        </div>
      </Button>
    )
  }

  #handleClick = e => {
    // WIP[recorder]
    this.$recording.value = true

    setTimeout(() => {
      this.$transcripting.value = true
      setTimeout(() => {
        this.$recording.value = false
        this.$transcripting.value = false
        this.$transcript.value = 'Quisque lobortis enim quis erat nisi condimentum, nullam a ipsum lacus. Eros nulla aptent convallis scelerisque class cursus non bibendum rutrum maecenas condimentum, dapibus phasellus taciti posuere porta arcu massa natoque ut enim. Posuere facilisis aliquam inceptos rhoncus vestibulum sollicitudin habitant nunc platea porta enim sagittis etiam volutpat, malesuada mi massa sodales magna tristique ad eros placerat tellus proin dictum.'
      }, 3_000)
    }, 3_000)
  }
}
