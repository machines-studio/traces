import './CreditsScreen.scss'

import { Component } from '@tooooools/ui'

import Config from '/controllers/Config'
import Gamepad from '/controllers/Gamepad'
import I18N from '/controllers/I18N'
import delay from '/utils/delay'

export default class CreditsScreen extends Component {
  static async load () {}

  template () {
    return (
      <section class='credits-screen screen'>
        <figure>
          <img src='/images/partners.png' />
          <figcaption innerHTML={I18N('credits')} />
        </figure>
      </section>
    )
  }

  afterRender () {
    Gamepad.on('a', this.#handleGamepadA)
  }

  async afterMount () {
    await delay(Config.CREDITS.displayDuration)
    window.location.reload()
  }

  #handleGamepadA = () => window.location.reload()

  beforeDestroy () {
    Gamepad.off('a', this.#handleGamepadA)
  }
}
