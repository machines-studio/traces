import './ConstellationScreen.scss'

import { Component } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'

import Caption from '/components/Caption'
import Constellation from '/components/Constellation'
import Particles from '/components/Particles'
import Config from '/controllers/Config'
import I18N from '/controllers/I18N'
import Session from '/controllers/Session'
import delay from '/utils/delay'
import widont from '/utils/string-widont'

export default class ConstellationScreen extends Component {
  $particlesLeaving = $(false)

  static async load () {
    Session.commit()
    if (Session.isComplete()) Session.prefetchSummary()
  }

  template () {
    return (
      <section
        class={[
          'constellation-screen screen',
          { 'is-complete': Session.isComplete() }
        ]}
      >
        <Constellation
          seed={Session.seed}
          length={Config.SESSION.rounds}
          artworks={Session.trace}
          ref={this.ref('constellation')}
        />

        <Particles
          {...Config.PARTICLES.presets.constellation}
          outerWidth={100}
          outerHeight={100}
          innerRadiusX={35}
          innerRadiusY={35}
          leaving={this.$particlesLeaving}
          ref={this.ref('particles')}
        />

        <Caption
          skippable
          position='bottom'
          text={widont(I18N(`constellation.${Session.trace.length}`, {}, null))}
          hint={widont(I18N(`constellation.${Session.trace.length}.hint`, {}, null))}
          ref={this.ref('caption')}
        />
      </section>
    )
  }

  async afterMount () {
    await Promise.all([
      delay(Config.CONSTELLATION.displayDuration),
      // Resolves once the caption's last word has finished appearing
      new Promise(resolve => {
        const words = this.refs.caption.base.querySelectorAll('.caption__text > *')
        const el = words[words.length - 1]
        if (!el) return resolve()

        el.addEventListener('animationend', function done (e) {
          if (e.target !== el) return
          el.removeEventListener('animationend', done)
          resolve()
        })
      })
    ])

    this.base.classList.add('is-leaving')
    this.$particlesLeaving.value = true

    await Promise.all([
      new Promise(resolve => {
        const el = this.refs.constellation.base
        const animation = window.getComputedStyle(el).getPropertyValue('animation')
        if (animation === 'none') return resolve()

        el.addEventListener('animationend', function done (e) {
          if (e.target !== el) return
          el.removeEventListener('animationend', done)
          resolve()
        })
      }),

      Session.isComplete() ? delay(2_000) : null,

      new Promise(resolve => this.refs.particles.base.firstElementChild.addEventListener('transitionend', resolve, { once: true }))
    ])

    Session.$screen.value = Session.isComplete() ? 'end' : 'question'
  }
}
