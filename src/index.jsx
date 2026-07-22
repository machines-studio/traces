import '/index.scss'

import { render } from '@tooooools/ui'
import { Toast } from '@tooooools/ui/components'
import { clamp } from 'missing-math'

import hello from '/data/hello.wav.b64?raw'
import * as Icons from '/data/icons'
import App from '/components/App'
import API from '/controllers/API'
import Config, { loadConfig, DEBUG } from '/controllers/Config'
import { checkMissingTranslations, loadTranslations } from '/controllers/I18N'
import Iddler from '/controllers/Iddler'
import Session from '/controllers/Session'

// Fetch config, translations, ping server and render app
;(async () => {
  await loadConfig()
  await loadTranslations()

  if (DEBUG.includes('translations')) checkMissingTranslations()

  if (!await API.ping()) return displayError('Cannot reach API')

  // ?debug=trace&step=N fast-fills Session.trace via the real load/commit pipeline.
  if (DEBUG.includes('trace')) {
    const params = new URLSearchParams(window.location.search)
    const step = clamp(Number(params.get('step')), 0, Config.SESSION.rounds)
    const landsOnConstellation = params.get('screen') === 'constellation'
    const rounds = landsOnConstellation ? Math.max(step - 1, 0) : step
    await Session.loadQuestions()
    for (let i = 0; i < rounds; i++) {
      await Session.loadQuestion()
      await Session.loadArtworks()
      Session.$artwork.value = Session.$artworks.value[0]
      Session.commit()
    }
    if (landsOnConstellation && step > 0) {
      await Session.loadQuestion()
      await Session.loadArtworks()
      Session.$artwork.value = Session.$artworks.value[0]
    }
  }

  // Warmup transcript backend with a tiny sample
  if (import.meta.env.PROD) {
    await API.fetchTranscript(new Blob([Uint8Array.from(atob(hello), c => c.charCodeAt(0))], { type: 'audio/wav' }))
  }

  window.App = render(<App />).components[0]
  Iddler.bind()
})()

// Display errors
const displayError = error => {
  // Print the original stack only, so devtools doesn't also show this handler's frame
  console.error(error?.stack || error)
  Toast.display([
    error,
    error?.stack?.length && <pre>{error.stack}</pre>
  ], {
    icon: Icons.error,
    tone: 'error',
    duration: 60_000
  })
}

window.addEventListener('error', e => {
  e.preventDefault()
  displayError(e.error)
})
window.addEventListener('unhandledrejection', e => {
  e.preventDefault()
  displayError(e.reason)
})

// Display warnings
const warn = console.warn.bind(console)
console.warn = (...args) => {
  warn(...args)
  Toast.display(args.map(a => <p>{a}</p>), {
    icon: Icons.warning,
    tone: 'warning',
    duration: 30_000
  })
}
