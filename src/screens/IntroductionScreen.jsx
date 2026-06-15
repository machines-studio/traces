import './IntroductionScreen.scss'
import { Component, Props } from '@tooooools/ui'
import i18n from '/data/i18n'

import Gamepad from '/controllers/Gamepad'

export default class IntroductionScreen extends Component {
  static props = {
    language: Props.required(Props.Signal),
    screen: Props.required(Props.Signal)
  }

  template () {
    return (
      <section
        class='introduction-screen screen'
      >
        {i18n('introduction.debug')}
      </section>
    )
  }

  afterRender () {
    Gamepad.on('b', this.#handleGamepadB)
  }

  beforeDestroy () {
    Gamepad.off('b', this.#handleGamepadB)
  }

  #handleGamepadB = () => { this.props.screen.value = 'home' }
}
