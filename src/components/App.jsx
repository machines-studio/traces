/* global h */
import './App.scss'

import { Component } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'

import { DEBUG } from '/app.config'
import HomeScreen from '/screens/HomeScreen'
import IntroductionScreen from '/screens/IntroductionScreen'

const SCREENS = {
  home: HomeScreen,
  introduction: IntroductionScreen
}

export default class App extends Component {
  $screen = $('home')
  $language = $(undefined)

  template () {
    return (
      <main
        class='app'
        data-debug={DEBUG}
        data-screen={this.$screen}
      />
    )
  }

  afterRender () {
    this.watch(this.$language, this.#handleLanguage)
    this.watch(this.$screen, this.#handleScreen, { immediate: true })
  }

  #handleLanguage = lang => { document.documentElement.lang = lang?.code }

  #handleScreen = screen => {
    this.refs.screen?.destroy()

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
