// This is the store
import { $, persist } from '@tooooools/ui/state'

import API from '/controllers/API'
import Config from '/controllers/Config'
import shuffle from '/utils/array-shuffle'
import id from '/utils/session-id'

const CACHE = new Map()

let seed = Date.now()
let summaryPromise = null

const Session = {
  // UI state
  $lang: persist('app.lang'), // en|fr
  $screen: $(new URLSearchParams(window.location.search).get('screen') ?? 'home'),

  // Data state
  $question: import.meta.env.DEV ? persist('app.question') : $(null),
  $artwork: import.meta.env.DEV ? persist('app.artwork') : $(null),
  $artworks: import.meta.env.DEV ? persist('app.artworks', []) : $([]),
  $summary: $(null),

  // Data
  seed,
  id: id(seed),
  questions: null, // consumable questions pool

  trace: [], // [{ question, artwork }, …] — artwork.testimony set by ArtworkScreen

  reset: () => {
    CACHE.clear()
    Session.seed = seed = Date.now()
    Session.id = id(seed)
    Session.questions = null
    Session.trace.length = 0
    Session.$summary.value = null
    summaryPromise = null
  },

  loadQuestions: async () => (
    Session.questions ??= shuffle(await API.fetchQuestions())
  ),

  loadQuestion: async () => (
    Session.$question.value ??= Session.questions.pop()
  ),

  loadArtworks: async () => {
    const key = Session.id + '_artworks_' + Session.$question.value.id

    if (!CACHE.has(key)) {
      const artworks = await API.fetchArtworks(
        Session.$question.value,
        Session.trace.map(({ artwork }) => artwork)
      )

      for (const artwork of artworks) {
        artwork.testimonies = await API.fetchTestimonies(artwork)
      }

      CACHE.set(key, artworks)
    }

    Session.$artworks.value = CACHE.get(key)
  },

  commit: () => {
    Session.trace.push({ question: Session.$question.value, artwork: Session.$artwork.value })
    Session.$question.value = null
    Session.$artwork.value = null
  },
  isComplete: () => Session.trace.length >= Config.SESSION.rounds,

  // Fired early (see ConstellationScreen) so it's ready by EndScreen; safe to call twice.
  prefetchSummary: () => (
    summaryPromise ??= (async () => {
      try {
        const artworks = Session.trace.map(({ artwork }) => artwork)
        const summary = await API.fetchSummary(Session.id, Session.$lang.value, artworks)
        Session.$summary.value = summary.content
      } catch (error) {
        console.error(error)
      }
    })()
  )
}

window.Session = Session
export default Session
