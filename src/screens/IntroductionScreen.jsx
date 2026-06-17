import './IntroductionScreen.scss'

import { Component, Props } from '@tooooools/ui'
import { Button } from '@tooooools/ui/components'
import { $, not } from '@tooooools/ui/state'

import i18n from '/data/i18n'
import Caption from '/components/Caption'
import Eyes from '/components/Eyes'
import GamepadRow from '/components/GamepadRow'
import Gamepad from '/controllers/Gamepad'

export default class IntroductionScreen extends Component {
  static props = {
    language: Props.required(Props.Signal),
    screen: Props.required(Props.Signal)
  }

  $step = $(0)

  template () {
    return (
      <section
        class='introduction-screen screen'
      >
        <Eyes />

        <Caption
          text={$(this.$step, step => i18n(`introduction.${step}`, null))}
          hint={$(this.$step, step => i18n(`introduction.${step}.hint`, null))}
          ref={this.ref('caption')}
        />
      </section>
    )
  }

  afterRender () {
    Gamepad.on('b', this.#handleGamepadB)
    this.watch(this.$step, this.#handleStep, { immediate: true })
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

    // Go to next screen when no more text to show
    if (i18n(`introduction.${this.$step.value}`, false)) return
    this.props.screen.value = 'question'
  }

  #handleStep = step => {
    const $prev = $(this.$step, step => i18n(`introduction.${step}.prev`, null))
    const $next = $(this.$step, step => i18n(`introduction.${step}.next`, null))

    this.refs.buttons?.destroy()
    this.refs.caption.render((
      <GamepadRow
        ref={this.ref('buttons')}
        initial='end'
      >
        <Button
          label={$prev}
          hidden={not($prev)}
          data-color='red'
          event-click={this.#handleNo}
        />

        <Button
          label={$next}
          hidden={not($next)}
          data-color='green'
          event-click={this.#handleYes}
        />
      </GamepadRow>
    ), this.refs.caption.base)
  }
}
