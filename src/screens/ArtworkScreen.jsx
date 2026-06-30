import './ArtworkScreen.scss'

import { Component, Props } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'

import GamepadRow from '/components/GamepadRow'

export default class ArtworkScreen extends Component {
  static props = {
    artwork: Props.required(Props.Signal),
    language: Props.required(Props.Signal),
    screen: Props.required(Props.Signal),
    question: Props.required(Props.Signal)
  }

  template ({ artwork }) {
    return (
      <section class='artwork-screen screen'>
        <GamepadRow initial='start' loop>
          <span innerText={$(artwork, a => a.vector)} />
        </GamepadRow>
      </section>
    )
  }
}
