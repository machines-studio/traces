import './Testimony.scss'
import { raf } from '@internet/raf'
import { Component, Props } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'

import * as Icons from '/data/icons'
import Config from '/controllers/Config'
import Gamepad from '/controllers/Gamepad'
import I18N from '/controllers/I18N'

export default class Testimony extends Component {
  static props = {
    transcript: Props.required(Props.string),
    timestamp: Props.required(Props.number),
    translation: Props.string,
    // TODO flag if in wait of moderation
  }

  #observer = null
  #delayTimer = null
  #distance = 0
  #scrolled = 0
  #target = 0
  #speed = Config.TESTIMONY.scrollSpeed

  $scrolling = $(false)

  template ({ transcript, translation, timestamp, location }) {
    return (
      <section class='testimony'>
        <div class='testimony__icon' innerHTML={Icons.testimony} />

        <div
          ref={this.ref('transcript')}
          class={[
            'testimony__transcript',
            { 'is-scrolling': this.$scrolling }
          ]}
        >
          <div class='testimony__vo' innerText={transcript} />
          <div class='testimony__translation' innerText={translation} />
        </div>

        <div class='testimony__metas'>
          <time class='testimony__date' innerText={I18N.date(timestamp)} /* TODO[I18N] */ />
          <div class='testimony__location' innerText={location} />
        </div>
      </section>
    )
  }

  afterMount () {
    this.#observer = new MutationObserver(() => {
      if (this.base.classList.contains('is-selected')) this.#scrollTranscript()
      else this.#resetTranscript()
    })

    this.#observer.observe(this.base, { attributeFilter: ['class'] })

    Gamepad.on('left', this.#handleGamepadLeft)
    Gamepad.on('right', this.#handleGamepadRight)
  }

  beforeDestroy () {
    this.#observer?.disconnect()
    clearTimeout(this.#delayTimer)
    raf.remove(this.#tick)

    Gamepad.off('left', this.#handleGamepadLeft)
    Gamepad.off('right', this.#handleGamepadRight)
  }

  #scrollTranscript = () => {
    const el = this.refs.transcript
    this.#distance = el.scrollWidth - el.clientWidth
    this.#scrolled = 0
    this.#target = 0
    if (this.#distance <= 0) return

    clearTimeout(this.#delayTimer)
    this.#delayTimer = setTimeout(() => {
      this.#target = this.#distance
      this.#speed = Config.TESTIMONY.scrollSpeed
      raf.add(this.#tick)
    }, Config.TESTIMONY.scrollDelay)
  }

  #resetTranscript = () => {
    clearTimeout(this.#delayTimer)
    raf.remove(this.#tick)
    this.refs.transcript.scrollLeft = 0
  }

  #tick = dt => {
    const step = this.#speed * dt / 1000
    const remaining = this.#target - this.#scrolled

    this.#scrolled += Math.sign(remaining) * Math.min(Math.abs(remaining), step)
    this.refs.transcript.scrollLeft = this.#scrolled
    this.$scrolling.value = this.refs.transcript.scrollLeft

    if (this.#scrolled === this.#target) raf.remove(this.#tick)
  }

  #handleGamepadLeft = () => this.#scrubTranscript(-Config.TESTIMONY.manualScrollStep)
  #handleGamepadRight = () => this.#scrubTranscript(Config.TESTIMONY.manualScrollStep)

  #scrubTranscript = delta => {
    if (!this.base.classList.contains('is-selected') || this.#distance <= 0) return

    clearTimeout(this.#delayTimer)
    this.#target = Math.min(Math.max(this.#scrolled + delta, 0), this.#distance)
    this.#speed = Math.abs(delta) / (Config.TESTIMONY.manualScrollDuration / 1000)
    raf.add(this.#tick)
  }
}
