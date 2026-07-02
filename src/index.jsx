import '/index.scss'
import { render } from '@tooooools/ui'
import { Toast } from '@tooooools/ui/components'

import * as Icons from '/data/icons'
import App from '/components/App'
import API from '/controllers/API'
import { loadConfig } from '/controllers/Config'
import { loadTranslations } from '/controllers/I18N'
import Iddler from '/controllers/Iddler'

// Fetch config, translations, ping server and render app
;(async () => {
  await loadConfig()
  await loadTranslations()

  if (!await API.ping()) return displayError('Cannot reach API')
  // TODO[API] warmup transcript by triggering a fake one (SEE pp1 README)

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
    duration: 30_000
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
    duration: 5_000
  })
}
