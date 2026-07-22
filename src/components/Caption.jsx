import './Caption.scss'
import { Component, Props } from '@tooooools/ui'
import { Button } from '@tooooools/ui/components'
import { $, not } from '@tooooools/ui/state'

import Gamepad from '/controllers/Gamepad'
import Voice from '/controllers/Voice'

export default class Caption extends Component {
  static props = {
    text: [Props.string, Props.Signal],
    hint: [Props.string, Props.Signal],
    muted: [Props.boolean, Props.Signal],
    skippable: Props.boolean,
    position: Props.required(Props.enum('top', 'bottom'))
  }

  $muted = $(this.props.muted ?? false)
  $skipped = $(false)

  template ({ text, hint, position }) {
    const $tokens = $(text, (text = '') => text
      ?.replace(/\n/g, '<br>') // Handle line-breaks
      .split(/(<pre>.*?<\/pre>|<[^>]+>|\s+)/) // Split by words, tags, or whole <pre> blocks
      .filter(token => token && !/^\s+$/.test(token))
      .map((token, index) => /^<[^>]+>$/.test(token)
        ? token
        : `<span style='--token-index: ${index}'>${token}</span>`
      ) ?? []
    )

    return (
      <section
        class={[
          'caption',
          {
            'is-muted': this.$muted,
            'is-skipped': this.$skipped
          }
        ]}
        data-position={position}
        style={{
          '--tokens-length': $($tokens, tokens => tokens.length + 1)
        }}
      >
        <div
          class='caption__text'
          innerHTML={$($tokens, tokens => tokens.join(' '))}
        />

        <Button
          class='caption__hint'
          hidden={not($(hint))}
          label={hint}
        />

        {this.props.children}
      </section>
    )
  }

  afterRender () {
    Gamepad.on('a', this.#handleGamepadA)
    this.watch($(this.props.text), this.#handleText, { immediate: true })
  }

  #handleText = text => {
    Voice.stop()
    this.$skipped.value = false
    if (this.$muted.value) return
    Voice.speak(text)
  }

  #handleGamepadA = () => {
    if (!this.props.skippable) return

    Voice.stop()
    this.$skipped.value = true
  }

  waitForAnimationEnd = () => new Promise(resolve => {
    const words = this.base.querySelectorAll('.caption__text > *')
    const el = words[words.length - 1]
    if (!el || this.$skipped.value) return resolve()

    const done = e => {
      if (e.target !== el) return
      el.removeEventListener('animationend', done)
      el.removeEventListener('animationcancel', done)
      resolve()
    }
    el.addEventListener('animationend', done)
    el.addEventListener('animationcancel', done)
  })

  beforeDestroy () {
    Voice.stop()
    Gamepad.off('a', this.#handleGamepadA)
  }
}
