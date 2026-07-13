// This is the store
import { $, persist } from '@tooooools/ui/state'

import API from '/controllers/API'
import Config from '/controllers/Config'
import lastOf from '/utils/array-last'
import shuffle from '/utils/array-shuffle'

const Session = {
  // UI state
  $lang: persist('app.lang'), // en|fr
  $screen: $(new URLSearchParams(window.location.search).get('screen') ?? 'home'),

  // Data state
  $question: import.meta.env.DEV ? persist('app.question') : $(null),
  $artwork: import.meta.env.DEV ? persist('app.artwork') : $(null),
  $artworks: import.meta.env.DEV ? persist('app.artworks', []) : $([]),

  // Data
  token: Date.now(),
  questions: null, // consumable questions pool
  trace: [], // [{ question, artwork }, …] committed history

  loadQuestions: async () => (Session.questions ??= shuffle(await API.fetchQuestions())),
  loadQuestion: async () => (Session.$question.value = Session.questions.pop()),
  loadArtworks: async () => (Session.$artworks.value = await API.fetchArtworks(Session.$question.value, lastOf(Session.trace)?.artwork)),
  commit: () => Session.trace.push({ question: Session.$question.value, artwork: Session.$artwork.value }),

  // ??? Allow pushing uncomplete trace
  isComplete: () => Session.trace.length >= Config.ROUNDS,

  // WIP[back]
  push: () => {}
}

window.Session = Session
export default Session
