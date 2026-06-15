/* global __VERSION__ */
import './HomeScreen.scss'
import { Component, Props } from '@tooooools/ui'

import { LANGUAGES } from '/app.config'
import SVGHeadline from '/headline.svg?raw'

import { Button } from '@tooooools/ui/components'
import GamepadRow from '/components/GamepadRow'

export default class HomeScreen extends Component {
  static props = {
    language: Props.required(Props.Signal),
    screen: Props.required(Props.Signal)
  }

  template () {
    return (
      <section
        class='home-screen screen'
      >
        <div class='headline' innerHTML={SVGHeadline} />

        <GamepadRow initial='start' loop>
          {LANGUAGES.map(language => (
            <Button
              label={language.name}
              event-click={this.#handleLanguage(language)}
            />
          ))}
        </GamepadRow>

        <footer>{__VERSION__}</footer>
      </section>
    )
  }

  #handleLanguage = language => e => {
    this.props.language.value = language
    // TODO animate, then switch screen
    this.props.screen.value = 'introduction'
  }
}
