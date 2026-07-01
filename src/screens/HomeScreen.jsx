import './HomeScreen.scss'

import { Component, Props } from '@tooooools/ui'
import { Button } from '@tooooools/ui/components'

import GamepadRow from '/components/GamepadRow'
import Ambience from '/controllers/Ambience'
import Config from '/controllers/Config'
import shuffle from '/utils/array-shuffle'

export default class HomeScreen extends Component {
  static props = {
    language: Props.required(Props.Signal),
    screen: Props.required(Props.Signal)
  }

  template () {
    const colors = shuffle(Object.keys(Config.COLORS))
    return (
      <section class='home-screen screen'>
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
    this.props.language.value = language
    this.base.classList.add('is-leaving')

    if (!e.isTrusted) { // Only if triggered from GamepadRow.#handleGamepadA
      // Wait for buttons transition before leaving screen
      await Promise.all(
        [...e.target.parentNode.children].map(el => new Promise(resolve => el.addEventListener('animationend', resolve, { once: true })))
      )
    }

    Ambience.start()
    this.props.screen.value = 'introduction'
  }
}
