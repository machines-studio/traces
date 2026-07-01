import '/index.scss'
import { render } from '@tooooools/ui'
import { Toast } from '@tooooools/ui/components'

import * as Icons from '/data/icons'
import App from '/components/App'
import { loadConfig } from '/controllers/Config'
import { loadTranslations } from '/controllers/I18N'

// Display errors
window.addEventListener('error', e => {
  console.error(e.error)
  Toast.display([
    <p>Une erreur inconnue est survenue{e.error.stack?.length ? '\u2009:' : ''}</p>,
    e.error.stack?.length && <pre>{e.error.stack}</pre>
  ], {
    icon: Icons.error,
    tone: 'error'
  })
})

// Display warnings
const warn = console.warn.bind(console)
console.warn = (...args) => {
  warn(...args)
  Toast.display(args.map(a => <p>{a}</p>), {
    icon: Icons.warning,
    tone: 'warning',
    duration: 5000
  })
}

// Fetch config, translations, and render app
;(async () => {
  await loadConfig()
  await loadTranslations()

  window.App = render(<App />).components[0]
})()
