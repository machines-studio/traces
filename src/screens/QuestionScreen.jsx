import './QuestionScreen.scss'

import { Component, Props } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'

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

  $artworksSelection = $(null)

  template () {
    return (
      <section class='question-screen screen'>
        <Eyes lookAt={this.$artworksSelection} />

        <GamepadRow
          ref={this.ref('artworksRow')}
    screen: Props.required(Props.Signal),
    artwork: Props.required(Props.Signal),
  }

  template () {
    // TODO dynamic
    const mockArtworks = [
      { vector: 'type', tags: ['color', 'picture', 'weird'] },
      { vector: 'emotion', tags: ['color', 'picture', 'weird'] },
      { vector: 'date', tags: ['color', 'picture', 'weird'] },
      { vector: 'description', tags: ['color', 'picture', 'weird'] },
    ]

    return (
      <section class='question-screen screen'>
        <Eyes />

        <GamepadRow
          loop
          initial='none'
          class='artworks'
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
          text={widont('What is the first memory that comes to mind when you think about your childhood?')}
          hint={i18n('question.hint')}
        />
      </section>
    )
  }

  afterMount () {
    this.watch(this.refs.artworksRow.$selection, selection => {
      this.$artworksSelection.value = selection
    }, { immediate: true })
  }
}
