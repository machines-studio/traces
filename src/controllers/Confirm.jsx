import { Modal, Button } from '@tooooools/ui/components'
import { batch } from '@tooooools/ui/state'

import GamepadRow from '/components/GamepadRow'
import I18N from '/controllers/I18N'
import Voice from '/controllers/Voice'

let modal

export default async ({
  message,
  yes = { label: I18N('confirm.yes') },
  no = { label: I18N('confirm.no') },
  ...props
} = {}) => {
  if (modal) return

  // Store state
  const previousGamepadRows = GamepadRow.$ROWS.value
  const previousGamepadIndex = GamepadRow.$INDEX.value
  GamepadRow.$ROWS.value = []

  // Stop voice if any
  Voice.stop()

  // Render modal
  const ok = await new Promise(resolve => Modal.display({
    ...props,
    locked: true,
    ref: c => (modal = c),
    children: [
      <div
        class='prose'
        innerHTML={message}
      />,
      <GamepadRow>
        <Button
          data-color={no.color ?? 'red'}
          label={no.label}
          event-click={e => {
            modal.destroy()
            resolve(false)
          }}
        />
        <Button
          data-color={yes.color ?? 'green'}
          label={yes.label}
          event-click={e => {
            modal.destroy()
            resolve(true)
          }}
        />
      </GamepadRow>
    ]
  }, document.querySelector('main')))

  // Restore state
  modal = undefined
  batch(() => {
    GamepadRow.$ROWS.value = previousGamepadRows
    GamepadRow.$INDEX.value = previousGamepadIndex
  })

  return ok
}
