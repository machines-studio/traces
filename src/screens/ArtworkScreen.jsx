import './ArtworkScreen.scss'

import { Component } from '@tooooools/ui'
import { $, slot } from '@tooooools/ui/state'

import Caption from '/components/Caption'
import Eyes from '/components/Eyes'
import GamepadRow from '/components/GamepadRow'
import Recorder from '/components/Recorder'
import Testimony from '/components/Testimony'
import Config, { DEBUG } from '/controllers/Config'
import Confirm from '/controllers/Confirm'
import Gamepad from '/controllers/Gamepad'
import I18N from '/controllers/I18N'
import Session from '/controllers/Session'
import lastOf from '/utils/array-last'
import widont from '/utils/string-widont'

const PANELS = {
  image: ({ src }) => <img src={src} />,
  text: ({ content }) => I18N.resolve(content) && <article>{I18N.resolve(content)}</article>,
  video: ({ src }) => <video autoplay muted><source src={src} /></video>,
  sound: ({ src }) => <audio controls src={src} />
}

export default class ArtworkScreen extends Component {
  $currentSection = slot(/* 'content|testimonies|recorder' */)
  $recording = slot()
  $transcripting = slot()

  template () {
    return (
      <section
        class={[
          'artwork-screen screen',
          { 'has-transcript': this.$transcript }
        ]}
        data-section={this.$currentSection}
        data-color={Config.COLORS.vectors[Session.$artwork.value.vector]}
      >
        <header class='artwork-screen__header'>
          {/* TODO constellation */}

          <Caption
            position='top'
            text={$([
              this.$currentSection,
              this.$recording,
              this.$transcripting,
            ], ([section, recording, transcripting]) => {
              switch (section) {
                case 'content':
                case 'testimonies':
                  return widont(I18N.resolve(Session.$question.value))
                case 'recorder':
                  return I18N('artwork.record.cta', { question: I18N.resolve(Session.$question.value) })
              }
            })}
            hint={$([
              this.$currentSection,
              this.$recording,
              this.$transcripting,
            ], ([section, recording, transcripting]) => {
              switch (section) {
                case 'content':
                  return I18N('artwork.hint.explore')
                case 'testimonies':
                  return I18N('artwork.hint.scroll-top')
                case 'recorder':
                  return recording
                    ? I18N('artwork.hint.recording', {}, null)
                    : transcripting
                      ? I18N('artwork.hint.transcripting', {}, null)
                      : I18N('artwork.hint.record-cta', {}, null)
              }
            })}
          />
        </header>

        <GamepadRow
          class='artwork-screen__content'
          initial='start'
          scroll={{ inline: 'nearest', ifNeeded: true }}
          event-focus={() => window.scrollTo(0, 0)}
          ref={this.refMap('rows', 'content')}
        >
          <div class='panel'>
            <article ref={this.ref('article')}>
              <header>
                <h1>{I18N.resolve(Session.$artwork.value.title)}</h1>
                <ul class='metas'>
                  <li>{Session.$artwork.value.date}</li>
                </ul>
              </header>

              <section
                ref={this.ref('prose')}
                class='prose'
                innerHTML={I18N.resolve(Session.$artwork.value.text)}
              />

              <footer>
                {Session.$artwork.value.tags.map(tag => (<span innerText={I18N.resolve(tag)} />))}
              </footer>
            </article>
          </div>

          {
            Session.$artwork.value.medias.map(({ type, src, caption, content }) => (type in PANELS && (src || content)) && (
              <div class='panel'>
                <figure>
                  {PANELS[type]?.({ src, content })}
                  <figcaption innerText={I18N.resolve(caption)} />
                </figure>
              </div>
            ))
          }
        </GamepadRow>

        <section class='artwork-screen__testimonies'>
          {
            Session.$artwork.value.testimonies.map((testimony, index) => (
              <GamepadRow
                initial='start'
                scroll={{ block: 'center' }}
                ref={this.refMap('rows', 'testimonies', { multiple: true })}
              >
                <Testimony
                  transcript={I18N.resolve(testimony.content)}
                  translation={testimony.transcript}
                  timestamp={testimony.timestamp}
                  location={I18N.resolve(testimony.location)}
                />
              </GamepadRow>
            ))
          }
        </section>

        <GamepadRow
          class='artwork-screen__recorder'
          scroll={{ block: 'center' }}
          ref={this.refMap('rows', 'recorder')}
        >
          <Recorder ref={this.ref('recorder')} />
          <Eyes />
        </GamepadRow>
      </section>
    )
  }

  afterRender () {
    Gamepad.on('a', this.#handleGamepadA)
    Gamepad.on('b', this.#handleGamepadB)

    // Connect to recorder state
    this.$recording.fill(this.refs.recorder.$recording)
    this.$transcripting.fill(this.refs.recorder.$transcripting)
    this.watch(this.refs.recorder.$transcript, this.#handleTranscript)

    // Keep track of currently focused section
    this.$currentSection.fill($([
      this.refs.rows.get('content').$hasFocus,
      ...this.refs.rows.get('testimonies').map(row => row.$hasFocus),
      this.refs.rows.get('recorder').$hasFocus,
    ], (rows) => {
      if (rows[0]) return 'content'
      if (lastOf(rows)) return 'recorder'
      return 'testimonies'
    }))
  }

  afterMount () {
    // Set the number of columns based on how much the text overflows
    const overflowRatio = this.refs.prose.scrollHeight / this.refs.prose.clientHeight
    this.refs.article.classList.toggle('is-large', overflowRatio > 1)
    this.refs.article.style.setProperty('--cols', Math.ceil(overflowRatio + 0.5))

    // Jump to recorder section
    if (DEBUG.includes('recorder')) {
      GamepadRow.$INDEX.value = GamepadRow.$ROWS.value.indexOf(this.refs.rows.get('recorder'))
    }
  }

  #handleGamepadA = () => {
    // // TODO[next] enter a full-screen view of a specific panel (text, video, image, etc…)
    // const selection = this.refs.rows.find(row => row.$hasFocus.value)?.selection
    // if (!selection) return
    // ;(selection.base ?? selection).classList.add('is-zoomed')
  }

  #handleGamepadB = () => {
    if (GamepadRow.$INDEX.value > 0) {
      // Scroll top
      GamepadRow.$INDEX.value = 0
    } else {
      // Go back to question screen if already on top
      Session.$screen.value = 'question'
    }
  }

  #handleTranscript = async transcript => {
    if (!transcript?.length) return

    const ok = await Confirm({
      title: I18N('artwork.transcript-modal.title'),
      message: transcript,
      yes: { label: I18N('artwork.transcript-modal.yes') },
      no: { label: I18N('artwork.transcript-modal.no') }
    })

    // Cleanup transcript so that user can re-record
    if (!ok) return this.refs.recorder.$transcript.reset()

    // WIP save transcript
    // await API.save(Session.$artwork.value, transcript)
    Session.commit()
    Session.$screen.value = Session.isComplete() ? 'end' : 'question' // WIP 'end' screen not implemented yet
  }

  beforeDestroy () {
    Gamepad.off('a', this.#handleGamepadA)
    Gamepad.off('b', this.#handleGamepadB)
  }
}
