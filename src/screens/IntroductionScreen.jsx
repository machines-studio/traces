import './IntroductionScreen.scss'

import { Component } from '@tooooools/ui'
import { Button } from '@tooooools/ui/components'
import { $, not } from '@tooooools/ui/state'

import Caption from '/components/Caption'
import Eyes from '/components/Eyes'
import GamepadRow from '/components/GamepadRow'
import Particles from '/components/Particles'
import Gamepad from '/controllers/Gamepad'
import I18N from '/controllers/I18N'
import Session from '/controllers/Session'
import widont from '/utils/string-widont'

export default class IntroductionScreen extends Component {
  $step = $(0)

  template () {
    return (
      <section
        class='introduction-screen screen'
      >
        <Eyes />
        <Particles />

        <Caption
          position='bottom'
          text={$(this.$step, step => widont(I18N(`introduction.${step}`, {}, null)))}
          hint={$(this.$step, step => widont(I18N(`introduction.${step}.hint`, {}, null)))}
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
    Session.$screen.value = 'home'
  }

  #handleNo = () => {
    this.$step.value--
    if (this.$step < 0) this.#handleGamepadB()
  }

  #handleYes = () => {
    this.$step.value++

    // Go to next screen when no more text to show
    if (I18N(`introduction.${this.$step.value}`, {}, false)) return
    Session.$screen.value = 'question'
  }

  #handleStep = step => {
    const $prev = $(this.$step, step => I18N(`introduction.${step}.prev`, {}, null))
    const $next = $(this.$step, step => I18N(`introduction.${step}.next`, {}, null))

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
