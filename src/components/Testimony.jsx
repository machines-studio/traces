import './Testimony.scss'
import { raf } from '@internet/raf'
import { Component, Props } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'

import * as Icons from '/data/icons'
import Config from '/controllers/Config'
import Gamepad from '/controllers/Gamepad'
import I18N from '/controllers/I18N'
import Voice from '/controllers/Voice'

export default class Testimony extends Component {
  static props = {
    index: Props.number,
    content: Props.required(Props.object, Props.string), // {fr, en, nl}
    status: Props.enum('pending', 'validated', 'censored'),
    created_at: Props.required(Props.string, Props.number),

    city: Props.string,
    lang: Props.string,
  }

  #observer = null
  #delayTimer = null
  #distance = 0
  #scrolled = 0
  #target = 0
  #speed = Config.TESTIMONIES.scrollSpeed

  $scrolling = $(false)

  template ({
    content,
    lang,
    created_at: createdAt,
    city
  }) {
    const vo = I18N.resolve(content, lang)
    const translation = I18N.resolve(content)

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
          {vo !== translation && <div class='testimony__vo' innerText={vo} />}
          <div class='testimony__translation' innerText={translation} />
        </div>

        <div class='testimony__metas'>
          <time class='testimony__date' innerText={I18N.date(createdAt)} />
          <div class='testimony__location' innerText={I18N(`city.${city}`)} />
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

  #scrollTranscript = () => {
    const presets = Object.keys(Config.VOICES?.presets ?? {}).filter(k => k.startsWith('testimonial'))
    const preset = presets[(this.props.index ?? 0) % presets.length] ?? 'testimonial'
    Voice.speak(this.props.transcript, preset)

    const el = this.refs.transcript
    this.#distance = el.scrollWidth - el.clientWidth
    this.#scrolled = 0
    this.#target = 0
    if (this.#distance <= 0) return

    clearTimeout(this.#delayTimer)
    this.#delayTimer = setTimeout(() => {
      this.#target = this.#distance
      this.#speed = Config.TESTIMONIES.scrollSpeed
      raf.add(this.#tick)
    }, Config.TESTIMONIES.scrollDelay)
  }

  #resetTranscript = () => {
    Voice.stop()
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

  #handleGamepadLeft = () => this.#scrubTranscript(-Config.TESTIMONIES.manualScrollStep)
  #handleGamepadRight = () => this.#scrubTranscript(Config.TESTIMONIES.manualScrollStep)

  #scrubTranscript = delta => {
    if (!this.base.classList.contains('is-selected') || this.#distance <= 0) return

    clearTimeout(this.#delayTimer)
    this.#target = Math.min(Math.max(this.#scrolled + delta, 0), this.#distance)
    this.#speed = Math.abs(delta) / (Config.TESTIMONIES.manualScrollDuration / 1000)
    raf.add(this.#tick)
  }

  beforeDestroy () {
    this.#observer?.disconnect()
    clearTimeout(this.#delayTimer)
    raf.remove(this.#tick)

    Voice.stop()
    Gamepad.off('left', this.#handleGamepadLeft)
    Gamepad.off('right', this.#handleGamepadRight)
  }
}
