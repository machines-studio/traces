import '/moderation.scss'

import { render } from '@tooooools/ui'

import Moderation from '/components/Moderation'
import { loadConfig } from '/controllers/Config'

;(async () => {
  await loadConfig()
  render(<Moderation />)
})()
