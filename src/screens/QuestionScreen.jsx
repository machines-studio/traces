import './QuestionScreen.scss'

import { Component } from '@tooooools/ui'
import { slot } from '@tooooools/ui/state'

import Artwork from '/components/Artwork'
import Caption from '/components/Caption'
import Eyes from '/components/Eyes'
import GamepadRow from '/components/GamepadRow'
import Gamepad from '/controllers/Gamepad'
import I18N from '/controllers/I18N'
import Iddler from '/controllers/Iddler'
import Session from '/controllers/Session'
import widont from '/utils/string-widont'

export default class QuestionScreen extends Component {
  $selection = slot(null)

  static async load () {
    await Session.loadQuestions()
    await Session.loadQuestion()
    await Session.loadArtworks()
  }

  template () {
    return (
      <section class='question-screen screen'>
        <Eyes lookAt={this.$selection} />

        <GamepadRow
          loop
          initial='none'
          class='artworks'
          ref={this.ref('artworksRow')}
        >
          {Session.$artworks.value.slice(0, 4).map(artwork => (
            <Artwork
              {...artwork}
              event-click={this.#handleArtwork(artwork)}
            />
          ))}
        </GamepadRow>

        <Caption
          skippable
          position='bottom'
          text={widont(I18N.resolve(Session.$question.value.content))}
          hint={I18N('question.hint')}
        />
      </section>
    )
  }

  afterMount () {
    this.$selection.fill(this.refs.artworksRow.$selection)
    Gamepad.on('b', Iddler.quit)
  }

  #handleArtwork = artwork => async e => {
    Session.$artwork.value = artwork

    if (!e.isTrusted) { // Only if triggered from GamepadRow.#handleGamepadA
      // Wait for buttons transition before leaving screen
      await new Promise(resolve => {
        this.base.addEventListener('animationend', resolve, { once: true })
        this.base.classList.add('is-leaving')
      })
    }

    Session.$screen.value = 'artwork'
  }

  beforeDestroy () {
    Gamepad.off('b', Iddler.quit)
  }
}
