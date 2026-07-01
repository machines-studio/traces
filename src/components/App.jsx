/* global h, __VERSION__ */
import './App.scss'

import { Component } from '@tooooools/ui'
import { $, persist } from '@tooooools/ui/state'

import Config, { DEBUG } from '/controllers/Config'
import SVGHeadline from '/headline.svg?raw'
import ArtworkScreen from '/screens/ArtworkScreen'
import HomeScreen from '/screens/HomeScreen'
import IntroductionScreen from '/screens/IntroductionScreen'
import QuestionScreen from '/screens/QuestionScreen'

// TODO goto home when more than X seconds without interaction (prompt?)

const SCREENS = {
  artwork: ArtworkScreen,
  home: HomeScreen,
  introduction: IntroductionScreen,
  question: QuestionScreen
}

export default class App extends Component {
  $screen = $(new URLSearchParams(window.location.search).get('screen') ?? 'home')
  $language = persist('app.language')

  $question = import.meta.env.DEV ? persist('app.question') : $(undefined)
  $artwork = import.meta.env.DEV ? persist('app.artwork') : $(undefined)

  template () {
    return (
      <main
        class='app'
        data-debug={DEBUG}
        data-screen={this.$screen}
        style={{
          // Add all --color-<NAME> from config.json
          ...Object.entries(Config.COLORS).reduce((acc, [key, value]) => ({
            ...acc,
            [`--color-${key}`]: value
          }), {})
        }}
      >
        <section
          class='app__stars'
          ref={this.refArray('waitForTransition')}
        >
          {
            [
              '/images/stars-1.png',
              '/images/stars-2.png',
              '/images/stars-3.png'
            ].map(src => <img src={src} />)
          }
        </section>

        <h1
          class='app__title'
          innerHTML={SVGHeadline}
          ref={this.refArray('waitForTransition')}
        />

        <div
          class='app__version'
          innerText={__VERSION__}
        />
      </main>
    )
  }

  afterRender () {
    this.watch(this.$language, this.#handleLanguage, { immediate: true })
    this.watch(this.$screen, this.#handleScreen, { immediate: true })
  }

  #handleLanguage = lang => { document.documentElement.lang = lang?.code }

  #handleScreen = async screen => {
    this.refs.screen?.destroy()

    this.base.classList.add('is-transitioning')
    await this.#waitForTransitions()
    this.base.classList.remove('is-transitioning')

    window.document.title = `TRACES → ${screen}`

    this.render(
      h(SCREENS[screen], {
        ref: this.ref('screen'),
        screen: this.$screen,
        language: this.$language,
        question: this.$question,
        artwork: this.$artwork
      }),
      this.base
    )
  }

  // Wait until CSS transitions triggered by the `data-screen` change
  // (on direct children of `.app` tracked in refs.waitForTransition)
  #waitForTransitions = () => Promise.all(
    this.refs.waitForTransition
      .filter(el => parseFloat(getComputedStyle(el).transitionDuration) > 0)
      .map(el => new Promise(resolve => {
        const done = e => {
          if (e.target !== el) return
          el.removeEventListener('transitionend', done)
          el.removeEventListener('transitioncancel', done)
          resolve()
        }

        el.addEventListener('transitionend', done)
        el.addEventListener('transitioncancel', done)
      }))
  )
}
