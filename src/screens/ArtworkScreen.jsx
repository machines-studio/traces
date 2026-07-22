import './ArtworkScreen.scss'

import { Component } from '@tooooools/ui'
import { Button } from '@tooooools/ui/components'
import { $, slot } from '@tooooools/ui/state'

import Caption from '/components/Caption'
import Eyes from '/components/Eyes'
import GamepadRow from '/components/GamepadRow'
import Recorder from '/components/Recorder'
import Testimonies from '/components/Testimonies'
import API from '/controllers/API'
import Config, { DEBUG } from '/controllers/Config'
import Confirm from '/controllers/Confirm'
import Gamepad from '/controllers/Gamepad'
import I18N from '/controllers/I18N'
import Session from '/controllers/Session'
import shuffle from '/utils/array-shuffle'
import any from '/utils/signal-any'
import widont from '/utils/string-widont'

const PANELS = {
  image: ({ src }) => <img src={src} />,
  text: ({ content }) => I18N.resolve(content) && <article>{I18N.resolve(content)}</article>,
  video: ({ src }) => <video autoplay muted><source src={src} /></video>,
  audio: ({ src }) => <audio controls src={src} />
}

export default class ArtworkScreen extends Component {
  $currentSection = slot(/* 'content|testimonies|recorder' */)
  $recording = slot()
  $transcripting = slot()

  template () {
    const artwork = Session.$artwork.value
    const testimonies = shuffle(artwork.testimonies.filter(testimony => testimony.status === 'validated'))
    const medias = (artwork.media_url ?? '').split(/,\s?/g).map(url => ({
      src: API.assets(url),
      type: (() => {
        switch (((/(?:\.([^.]+))?$/.exec(url) ?? [])[1] ?? '').toLowerCase()) {
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'webp':
            return 'image'
          case 'mp4':
          case 'webm':
            return 'video'
          case 'mp3':
          case 'ogg':
            return 'audio'
        }
      })(),
      caption: null, // TODO[next]
      content: null // TODO[next] support for internationalized proses
    }))

    return (
      <section
        class='artwork-screen screen'
        data-section={this.$currentSection}
        data-color={Config.COLORS.criterions[artwork.criterion]}
      >
        <header class='artwork-screen__header'>
          <Caption
            skippable
            position='top'
            muted={$(this.$currentSection, section => section === 'content')}
            text={$([
              this.$currentSection,
              this.$recording,
              this.$transcripting,
            ], ([section, recording, transcripting]) => {
              switch (section) {
                case 'content':
                case 'testimonies':
                  return widont(I18N.resolve(Session.$question.value.content))
                case 'recorder':
                  return I18N('artwork.record.cta', { question: I18N.resolve(Session.$question.value.content) })
                case 'skip':
                  return I18N('artwork.record.skip')
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
                  return I18N('artwork.hint.testimonies')
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
          scroll={{ inline: 'center' }}
          event-focus={() => window.requestAnimationFrame(() => window.scrollTo(0, 0))}
          ref={this.refMap('rows', 'content')}
        >
          <div class='panel'>
            <article ref={this.ref('article')}>
              {artwork.title && <h1>{I18N.resolve(artwork.title)}</h1>}

              <section
                ref={this.ref('prose')}
                class='prose'
                innerHTML={I18N.resolve(artwork.description)}
              />

              <footer>
                <span innerText={I18N.resolve(artwork.type_of_object)} />
                <span innerText={I18N.resolve(artwork.date_period)} />
                <span innerText={I18N.resolve(artwork.origin)} />
              </footer>
            </article>
          </div>

          {
            medias.map(({ type, src, caption, content }) => (type in PANELS && (src || content)) && (
              <div class='panel'>
                <figure>
                  {PANELS[type]?.({ src, content })}
                  <figcaption innerText={I18N.resolve(caption)} />
                </figure>
              </div>
            ))
          }
        </GamepadRow>

        {testimonies.length > 0 && (
          <Testimonies
            testimonies={testimonies}
            ref={this.refMap('rows', 'testimonies')}
          />
        )}

        <section class='artwork-screen__recorder'>
          <GamepadRow
            initial='start'
            event-focus={() => window.requestAnimationFrame(() => window.scrollTo(0, document.body.scrollHeight))}
            class='recorder-wrapper'
            capture={any(this.$recording, this.$transcripting)}
            ref={this.refMap('rows', 'recorder')}
          >
            <Recorder ref={this.ref('recorder')} />
            <Eyes />
          </GamepadRow>

          <GamepadRow
            initial='start'
            class='skip'
            event-focus={() => window.requestAnimationFrame(() => window.scrollTo(0, document.body.scrollHeight))}
            ref={this.refMap('rows', 'skip')}
          >
            <Button
              disabled={any(this.$recording, this.$transcripting)}
              label={I18N('artwork.record.skip-cta')}
              event-click={this.#handleSkip}
            />
          </GamepadRow>
        </section>
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
  }

  afterMount () {
    // Keep track of currently focused section, computed straight from $INDEX rather
    // than combining each section's own $hasFocus signal (those fan out independently
    // off the same $INDEX write and can be observed in a transient, inconsistent state).
    this.watch(GamepadRow.$INDEX, index => {
      const row = GamepadRow.$ROWS.value[index]
      if (row === this.refs.rows.get('content')) this.$currentSection.value = 'content'
      else if (row === this.refs.rows.get('recorder')) this.$currentSection.value = 'recorder'
      else if (row === this.refs.rows.get('skip')) this.$currentSection.value = 'skip'
      else if (this.refs.rows.get('testimonies')?.hasRow(row)) this.$currentSection.value = 'testimonies'
    }, { immediate: true })

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
    // TODO[next] enter a full-screen view of a specific panel (text, video, image, etc…)
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

    await API.pushTestimony(Session.$artwork.value, transcript, Session.id)
    // Kept for the end-of-session summary prompt — see Session.trace.
    Session.$artwork.value.testimony = transcript
    Session.$screen.value = 'constellation'
  }

  #handleSkip = () => {
    Session.$screen.value = 'constellation'
  }

  beforeDestroy () {
    Gamepad.off('a', this.#handleGamepadA)
    Gamepad.off('b', this.#handleGamepadB)
  }
}
