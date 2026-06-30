import './QuestionScreen.scss'

import { Component, Props } from '@tooooools/ui'
import { $, slot } from '@tooooools/ui/state'

import i18n from '/data/i18n'
import Artwork from '/components/Artwork'
import Caption from '/components/Caption'
import Eyes from '/components/Eyes'
import GamepadRow from '/components/GamepadRow'
import widont from '/utils/string-widont'

export default class QuestionScreen extends Component {
  static props = {
    language: Props.required(Props.Signal),
    screen: Props.required(Props.Signal),
    artwork: Props.required(Props.Signal),
    question: Props.required(Props.Signal)
  }

  $selection = slot(null)

  template ({ question, language }) {
    // TODO dynamic
    const mockArtworks = [
      { vector: 'type', tags: ['color', 'picture', 'weird'] },
      { vector: 'emotion', tags: ['color', 'picture', 'weird'] },
      { vector: 'date', tags: ['color', 'picture', 'weird'] },
      { vector: 'description', tags: ['color', 'picture', 'weird'] },
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
          text={$(question, ([question, language]) => widont(question?.[language.code]))}
          hint={i18n('question.hint')}
        />
      </section>
    )
  }

  afterMount () {
    this.$selection.fill(this.refs.artworksRow.$selection)
  }

  #handleArtwork = artwork => async e => {
    // WIP
    this.props.artwork.value = artwork
    this.props.screen.value = 'artwork'
  }
}
