import { raf } from '@internet/raf'
import Emitter from 'tiny-emitter'

import { DEBUG, GAMEPAD } from '/app.config'

const emitter = new Emitter()
export default emitter

// Bind gamepad
window.addEventListener('gamepadconnected', e => raf.add(tick))
window.addEventListener('gamepaddisconnected', e => raf.remove(tick))

// Bind keyboard
window.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowUp': emitter.emit('up'); break
    case 'ArrowRight': emitter.emit('right'); break
    case 'ArrowDown': emitter.emit('down'); break
    case 'ArrowLeft': emitter.emit('left'); break

    case 'a':
    case 'Enter':
      emitter.emit('a'); break

    case 'b':
    case 'Escape':
      emitter.emit('b'); break

    default: return
  }

  e.preventDefault()
})

// Gamepad RAF
const debounced = {}
function tick (dt) {
  // Get current state
  const [gamepad] = navigator.getGamepads()
  if (!gamepad) return
  const axes = gamepad.axes.map(axe => Math.round(axe))
  const buttons = gamepad.buttons.map(button => button.value)

  // Init debounce state to avoid false positives
  debounced.axes ??= [...axes]
  debounced.buttons ??= [...buttons]

  if (DEBUG?.includes('gamepad')) {
    for (let i = 0; i < axes.length; i++) {
      if (axes[i] === debounced.axes[i]) continue
      console.log('axe', i, axes[i], debounced.axes[i])
    }

    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i] === debounced.buttons[i]) continue
      console.log('button', i, buttons[i], debounced.buttons[i])
    }
  }

  // X axis
  if (axes[GAMEPAD.axes.x] && !debounced.axes[GAMEPAD.axes.x]) {
    const v = axes[GAMEPAD.axes.x] * (GAMEPAD.axes.invertX ? -1 : 1)
    emitter.emit(v < 0 ? 'left' : 'right')
  }

  // Y axis
  if (axes[GAMEPAD.axes.y] && !debounced.axes[GAMEPAD.axes.y]) {
    const v = axes[GAMEPAD.axes.y] * (GAMEPAD.axes.invertY ? -1 : 1)
    if (v !== 0) emitter.emit(v < 0 ? 'up' : 'down')
  }

  // Trigger on buttons change)
  if (buttons[GAMEPAD.buttons.a] && !debounced.buttons[GAMEPAD.buttons.a]) emitter.emit('a')
  if (buttons[GAMEPAD.buttons.b] && !debounced.buttons[GAMEPAD.buttons.b]) emitter.emit('b')

  // Store for debounce
  debounced.axes = [...axes]
  debounced.buttons = [...buttons]
}
