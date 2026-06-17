import './QuestionScreen.scss'

import { Component, Props } from '@tooooools/ui'

export default class QuestionScreen extends Component {
  static props = {
    language: Props.required(Props.Signal),
    screen: Props.required(Props.Signal)
  }

  template () {
    return (
      <section class='question-screen screen'>
        TODO
      </section>
    )
  }
}
