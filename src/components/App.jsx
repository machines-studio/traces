/* global h, __VERSION__ */
import './App.scss'

import { Component } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'

import { COLORS, DEBUG } from '/app.config'
import SVGHeadline from '/headline.svg?raw'
import HomeScreen from '/screens/HomeScreen'
import IntroductionScreen from '/screens/IntroductionScreen'

const SCREENS = {
  home: HomeScreen,
  introduction: IntroductionScreen
}

export default class App extends Component {
  $screen = $(new URLSearchParams(window.location.search).get('screen') ?? 'home')
  $language = $(import.meta.env.DEV ? { code: 'en' } : undefined)

  template () {
    return (
      <main
        class='app'
        data-debug={DEBUG}
        data-screen={this.$screen}
        style={{
          // Add all --color-<NAME> from app.config
          ...Object.entries(COLORS).reduce((acc, [key, value]) => ({
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
          ref={this.refArray('waitForTransition')}
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
        language: this.$language
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
