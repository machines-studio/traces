import './HomeScreen.scss'

import { Component } from '@tooooools/ui'
import { Button } from '@tooooools/ui/components'
import { $ } from '@tooooools/ui/state'

import GamepadRow from '/components/GamepadRow'
import Particles from '/components/Particles'
import Ambience from '/controllers/Ambience'
import Config from '/controllers/Config'
import Session from '/controllers/Session'
import shuffle from '/utils/array-shuffle'

export default class HomeScreen extends Component {
  $particlesLeaving = $(false)

  static async load () {
    Session.reset()
  }

  template () {
    const colors = shuffle(Object.keys(Config.COLORS))
    return (
      <section class='home-screen screen'>
        <Particles
          {...Config.PARTICLES.presets.home}
          outerWidth={100}
          outerHeight={100}
          leaving={this.$particlesLeaving}
          ref={this.ref('particles')}
        />

        <GamepadRow initial='start' loop>
          {Config.LANGUAGES.map((language, index) => (
            <Button
              data-color={colors[index]}
              label={language.name}
              event-click={this.#handleLanguage(language)}
            />
          ))}
        </GamepadRow>
      </section>
    )
  }

  #handleLanguage = language => async e => {
    Session.$lang.value = language.code
    this.base.classList.add('is-leaving')
    this.$particlesLeaving.value = true

    if (!e.isTrusted) { // Only if triggered from GamepadRow.#handleGamepadA
      // Wait for buttons and particles transitions before leaving screen
      // (all particles share the same fade-out duration/delay, so waiting
      // on any single one is enough)
      await Promise.all([
        ...[...e.target.parentNode.children].map(el => new Promise(resolve => el.addEventListener('animationend', resolve, { once: true }))),
        new Promise(resolve => this.refs.particles.base.firstElementChild.addEventListener('transitionend', resolve, { once: true }))
      ])
    }

    Ambience.start()
    Session.$screen.value = 'introduction'
  }
}
