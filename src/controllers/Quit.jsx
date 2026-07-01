import { Modal, Button } from '@tooooools/ui/components'

import GamepadRow from '/components/GamepadRow'
import I18N from '/controllers/I18N'

let modal

export async function prompt () {
  if (modal) return

  // Store state
  const previousGamepadRows = GamepadRow.$ROWS.value
  GamepadRow.$ROWS.value = []

  await Modal.display({
    ref: c => (modal = c),
    locked: true,
    title: I18N('quit.title'),
    children: [
      <div class='prose' innerHTML={I18N('quit.message')} />,
      <GamepadRow>
        <Button
          data-color={I18N('quit.cancel.color')}
          label={I18N('quit.cancel')}
          event-click={e => modal.destroy()}
        />
        <Button
          data-color={I18N('quit.confirm.color')}
          label={I18N('quit.confirm')}
          event-click={e => {
            // Go home by reloading, to ensure full state reset and prevent memory leaks)
            window.location.reload()
          }}
        />
      </GamepadRow>
    ]
  }, document.querySelector('main'))

  // Restore sate
  modal = undefined
  GamepadRow.$ROWS.value = previousGamepadRows
}

// TODO add a iddle timer

export default { prompt }
