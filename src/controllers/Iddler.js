import { $ } from '@tooooools/ui/state'

import Config, { DEBUG } from '/controllers/Config'
import Confirm from '/controllers/Confirm'
import Gamepad from '/controllers/Gamepad'
import I18N from '/controllers/I18N'

let iddleTimer

export function bind () {
  // Reset the iddle timer on any gamepad activity
  for (const event of ['up', 'right', 'down', 'left', 'a', 'b']) {
    Gamepad.on(event, reset)
  }
}

export function reset () {
  clearTimeout(iddleTimer)
  if (DEBUG?.includes('no-iddle')) return
  iddleTimer = setTimeout(() => quit({ fromIddle: true }), Config.SESSION.iddleDuration)
}

export async function quit ({ fromIddle = false } = {}) {
  // Start auto confirm timer when from iddle
  let autoConfirmTimer
  let autoConfirmInterval
  const $confirmLabel = $(I18N('session.quit.confirm'))
  if (fromIddle) {
    let remaining = Config.SESSION.iddleConfirmDelay
    const updateLabel = () => {
      $confirmLabel.value = `${I18N('session.quit.confirm')} (${Math.ceil(remaining / 1000)})`
    }

    updateLabel()
    autoConfirmInterval = setInterval(() => {
      remaining -= 1000
      updateLabel()
    }, 1000)

    autoConfirmTimer = setTimeout(() => window.location.reload(), Config.SESSION.iddleConfirmDelay)
  }

  // Render actual modal
  const ok = await Confirm({
    title: I18N(fromIddle ? 'session.quit.iddle.title' : 'session.quit.title'),
    message: I18N(fromIddle ? 'session.quit.iddle.message' : 'session.quit.message'),
    no: {
      color: I18N('session.quit.cancel.color'),
      label: I18N('session.quit.cancel')
    },
    yes: {
      color: I18N('session.quit.confirm.color'),
      label: $confirmLabel
    }
  })

  // Go home by reloading, to ensure full state reset and prevent memory leaks
  if (ok) window.location.reload()

  // Restore sate
  clearTimeout(autoConfirmTimer)
  clearInterval(autoConfirmInterval)
  reset()
}

export default {
  bind,
  reset,
  quit
}
