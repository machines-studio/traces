import { Modal, Button } from '@tooooools/ui/components'
import { $ } from '@tooooools/ui/state'

import GamepadRow from '/components/GamepadRow'
import Config, { DEBUG } from '/controllers/Config'
import Gamepad from '/controllers/Gamepad'
import I18N from '/controllers/I18N'
import Voice from '/controllers/Voice'

let modal
let iddleTimer

export function bindIddleTimer () {
  // Reset the iddle timer on any gamepad activity
  for (const event of ['up', 'right', 'down', 'left', 'a', 'b']) {
    Gamepad.on(event, resetIddleTimer)
  }
}

export function resetIddleTimer () {
  clearTimeout(iddleTimer)
  if (modal) return
  if (DEBUG?.includes('no-iddle')) return
  iddleTimer = setTimeout(() => quit({ fromIddle: true }), Config.SESSION.iddleDuration)
}

export async function quit ({ fromIddle = false } = {}) {
  if (modal) return

  // Store state
  const previousGamepadRows = GamepadRow.$ROWS.value
  GamepadRow.$ROWS.value = []

  // Go home by reloading, to ensure full state reset and prevent memory leaks
  const confirm = () => window.location.reload()

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

    autoConfirmTimer = setTimeout(confirm, Config.SESSION.iddleConfirmDelay)
  }

  // Stop voice if any
  Voice.stop()

  // Render actual modal
  await Modal.display({
    ref: c => (modal = c),
    locked: true,
    title: I18N(fromIddle ? 'session.quit.iddle.title' : 'session.quit.title'),
    children: [
      <div
        class='prose'
        innerHTML={I18N(fromIddle ? 'session.quit.iddle.message' : 'session.quit.message')}
      />,
      <GamepadRow>
        <Button
          data-color={I18N('session.quit.cancel.color')}
          label={I18N('session.quit.cancel')}
          event-click={e => modal.destroy()}
        />
        <Button
          data-color={I18N('session.quit.confirm.color')}
          label={$confirmLabel}
          event-click={confirm}
        />
      </GamepadRow>
    ]
  }, document.querySelector('main'))

  // Restore sate
  clearTimeout(autoConfirmTimer)
  clearInterval(autoConfirmInterval)
  modal = undefined
  GamepadRow.$ROWS.value = previousGamepadRows
  resetIddleTimer()
}

export default {
  bindIddleTimer,
  resetIddleTimer,
  quit
}
