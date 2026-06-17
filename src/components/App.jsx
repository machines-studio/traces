/* global h, __VERSION__ */
import './App.scss'

import { Component } from '@tooooools/ui'
import { $, persist } from '@tooooools/ui/state'

import { COLORS, DEBUG } from '/app.config'
import SVGHeadline from '/headline.svg?raw'
import HomeScreen from '/screens/HomeScreen'
import IntroductionScreen from '/screens/IntroductionScreen'

const SCREENS = {
  home: HomeScreen,
  introduction: IntroductionScreen
}

export default class App extends Component {
  $screen = import.meta.env.DEV ? persist('home', 'app.screen') : $('home')
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
        <section class='app__stars'>
          {
            [
              '/images/stars-1.png',
              '/images/stars-2.png',
              '/images/stars-3.png'
            ].map(src => (<img src={src} />))
          }
        </section>

        <h1
          class='app__title'
          innerHTML={SVGHeadline}
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

  #handleScreen = screen => {
    this.refs.screen?.destroy()

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
}
