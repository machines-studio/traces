/* global h, __VERSION__ */
import './App.scss'

import { Component } from '@tooooools/ui'

import Config, { DEBUG } from '/controllers/Config'
import Session from '/controllers/Session'
import SVGHeadline from '/headline.svg?raw'
import ArtworkScreen from '/screens/ArtworkScreen'
import HomeScreen from '/screens/HomeScreen'
import IntroductionScreen from '/screens/IntroductionScreen'
import QuestionScreen from '/screens/QuestionScreen'

const SCREENS = {
  artwork: ArtworkScreen,
  home: HomeScreen,
  introduction: IntroductionScreen,
  question: QuestionScreen
}

export default class App extends Component {
  template () {
    return (
      <main
        class='app'
        data-debug={DEBUG}
        data-screen={Session.$screen}
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
    this.watch(Session.$lang, this.#handleLang, { immediate: true })
    this.watch(Session.$screen, this.#handleScreen, { immediate: true })
  }

  #handleLang = lang => { document.documentElement.lang = lang }

  #handleScreen = async name => {
    this.refs.screen?.destroy()
    const screen = SCREENS[name]
    if (!screen) throw new Error(`Screen '${name}' does not exist`)

    this.base.classList.add('is-transitioning')
    await this.#waitForTransitions()
    await screen.load?.()
    this.base.classList.remove('is-transitioning')

    window.document.title = `TRACES → ${name}`

    this.render(
      h(screen, { ref: this.ref('screen') }),
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
