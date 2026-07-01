import './QuestionScreen.scss'

import { Component, Props } from '@tooooools/ui'
import { $, slot } from '@tooooools/ui/state'

import Artwork from '/components/Artwork'
import Caption from '/components/Caption'
import Eyes from '/components/Eyes'
import GamepadRow from '/components/GamepadRow'
import Gamepad from '/controllers/Gamepad'
import I18N from '/controllers/I18N'
import Quit from '/controllers/Quit'
import widont from '/utils/string-widont'

export default class QuestionScreen extends Component {
  static props = {
    language: Props.required(Props.Signal),
    screen: Props.required(Props.Signal),
    artwork: Props.required(Props.Signal),
    question: Props.required(Props.Signal)
  }

  $selection = slot(null)

  beforeRender () {
    // WIP[back]
    this.props.question.value = {
      fr: 'Quel est le premier souvenir qui vous vient à l’esprit lorsque vous pensez à votre enfance?',
      en: 'What is the first memory that comes to mind when you think about your childhood?'
    }
  }

  template ({ question, language }) {
    // WIP[back]
    const mockArtworks = [
      { vector: 'type', tags: ['color', 'picture', 'weird'], },
      { vector: 'emotion', tags: ['color', 'picture', 'weird'], },
      { vector: 'date', tags: ['color', 'picture', 'weird'], },
      { vector: 'description', tags: ['color', 'picture', 'weird'], },
    ]

    return (
      <section class='question-screen screen'>
        <Eyes lookAt={this.$selection} />

        <GamepadRow
          loop
          initial='none'
          class='artworks'
          ref={this.ref('artworksRow')}
        >
          {mockArtworks.map(artwork => (
            <Artwork
              vector={artwork.vector}
              tags={artwork.tags}
              event-click={this.#handleArtwork(artwork)}
            />
          ))}
        </GamepadRow>

        <Caption
          position='bottom'
          text={$(question, question => widont(I18N.translate(question)))}
          hint={I18N('question.hint')}
        />
      </section>
    )
  }

  afterMount () {
    this.$selection.fill(this.refs.artworksRow.$selection)
    Gamepad.on('b', Quit.prompt)
  }

  #handleArtwork = artwork => async e => {
    this.props.artwork.value = artwork
    this.props.screen.value = 'artwork'
  }

  beforeDestroy () {
    Gamepad.off('b', Quit.prompt)
  }
}
