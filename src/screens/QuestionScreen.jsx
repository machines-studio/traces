import './QuestionScreen.scss'

import { Component, Props } from '@tooooools/ui'

import i18n from '/data/i18n'
import Artwork from '/components/Artwork'
import Caption from '/components/Caption'
import Eyes from '/components/Eyes'
import GamepadRow from '/components/GamepadRow'
import widont from '/utils/string-widont'

export default class QuestionScreen extends Component {
  static props = {
    language: Props.required(Props.Signal),
    screen: Props.required(Props.Signal)
  }

  template () {
    return (
      <section class='question-screen screen'>
        <Eyes />

        <GamepadRow
          loop
          initial='none'
          class='artworks'
        >
          <Artwork />
          <Artwork />
          <Artwork />
          <Artwork />
        </GamepadRow>

        <Caption
          text={widont('What is the first memory that comes to mind when you think about your childhood?')}
          hint={i18n('question.hint')}
        />
      </section>
    )
  }
}
