import './IntroductionScreen.scss'

import { Component, Props } from '@tooooools/ui'
import { Button } from '@tooooools/ui/components'
import { $, not } from '@tooooools/ui/state'

import i18n from '/data/i18n'
import Caption from '/components/Caption'
import Eyes from '/components/Eyes'
import Gamepad from '/controllers/Gamepad'

export default class IntroductionScreen extends Component {
  static props = {
    language: Props.required(Props.Signal),
    screen: Props.required(Props.Signal)
  }

  $step = $(0)

  template () {
    const $noLabel = $(this.$step, step => i18n(`introduction.${step}.no`, false))
    const $yesLabel = $(this.$step, step => i18n(`introduction.${step}.yes`, false))

    return (
      <section
        class='introduction-screen screen'
      >
        <Eyes />

        <Caption
          text={$(this.$step, step => i18n(`introduction.${step}`, false))}
          hint={$(this.$step, step => i18n(`introduction.${step}.hint`, false))}
        >
          <Button
            label={$noLabel}
            hidden={not($noLabel)}
            data-color='red'
            event-click={this.#handleNo}
          />

          <Button
            label={$yesLabel}
            hidden={not($yesLabel)}
            data-color='green'
            event-click={this.#handleYes}
          />
        </Caption>
      </section>
    )
  }

  afterRender () {
    Gamepad.on('b', this.#handleGamepadB)
  }

  beforeDestroy () {
    Gamepad.off('b', this.#handleGamepadB)
  }

  #handleGamepadB = () => {
    this.props.screen.value = 'home'
  }

  #handleNo = () => {
    this.$step.value--
    if (this.$step < 0) this.#handleGamepadB()
  }

  #handleYes = () => {
    this.$step.value++
    // TODO handle next screen
  }
}
