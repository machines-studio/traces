import './GamepadRow.scss'

import { Component, Props } from '@tooooools/ui'
import { $, isSignal, slot } from '@tooooools/ui/state'
import { clamp } from 'missing-math'

import Gamepad from '/controllers/Gamepad'
import Voice from '/controllers/Voice'
import noop from '/utils/noop'
import scrollIntoViewNearest from '/utils/scroll-into-view-nearest'

const $ROWS = $([])
const $INDEX = $(0)

// Tracks the currently focused row's own $capture signal, re-pointing as focus moves.
// While captured, `up`/`down` must not move focus away from the focused row.
const $CAPTURED = slot()
$CAPTURED.fill($(false))
$([$ROWS, $INDEX], ([rows = [], index]) => $CAPTURED.fill(rows[index]?.$capture ?? $(false)))

// Ignored rows (e.g. a paginated row hidden on the current page) stay registered at
// their DOM position but are excluded from `up`/`down` traversal.
const moveFocus = step => {
  const visible = $ROWS.value.filter(row => !row.$ignore.value)
  const position = visible.indexOf($ROWS.value[$INDEX.value])
  const row = visible[clamp(position + step, 0, visible.length - 1)]
  if (row) $INDEX.value = $ROWS.value.indexOf(row)
}

Gamepad.on('up', () => { if (!$CAPTURED.value) moveFocus(-1) })
Gamepad.on('down', () => { if (!$CAPTURED.value) moveFocus(1) })
$ROWS.subscribe((rows = []) => { $INDEX.value = clamp($INDEX.value, 0, rows.length - 1) })

export default class Row extends Component {
  static $ROWS = $ROWS
  static $INDEX = $INDEX

  static props = {
    initial: [Props.enum('start', 'proportional', 'end', 'none'), Props.number, Props.Signal],
    capture: [Props.boolean, Props.Signal],
    ignore: [Props.boolean, Props.Signal],
    scroll: Props.object
  }

  $index = $(0)
  $ignore = $(this.props.ignore ?? false) // excluded from up/down traversal while true
  $hasFocus = $([$ROWS, $INDEX, this.$ignore], ([rows = [], index, ignore]) => !ignore && index === rows.indexOf(this))
  $selection = $(null) // currently selected element, or null when none is selected
  $capture = $(this.props.capture ?? false) // driven externally by the caller

  template (props) {
    return (
      <section
        class={[
          'gamepad-row',
          props.class,
          {
            'has-focus': this.$hasFocus,
            'is-ignored': this.$ignore
          }
        ]}
        style={props.style}
      >
        {props.children}
      </section>
    )
  }

  get selectable () {
    return Array.from(this.base.querySelectorAll(':scope > *:not([data-gamepad-ignore])'))
      .filter(element => element.checkVisibility())
  }

  get selection () {
    return this.$hasFocus.value
      ? this.selectable[this.$index]
      : null
  }

  register () {
    $ROWS.value = [...$ROWS.value ?? [], this]

    Gamepad.on('a', this.#handleGamepadA)
    Gamepad.on('left', this.#handleGamepadLeft)
    Gamepad.on('right', this.#handleGamepadRight)
  }

  unregister () {
    Gamepad.off('a', this.#handleGamepadA)
    Gamepad.off('left', this.#handleGamepadLeft)
    Gamepad.off('right', this.#handleGamepadRight)

    // Remove row from $ROWS
    $ROWS.value = [
      ...$ROWS.value.slice(0, $ROWS.value.indexOf(this)),
      ...$ROWS.value.slice($ROWS.value.indexOf(this) + 1)
    ]
  }

  afterMount () {
    this.register()
    this.watch(this.$hasFocus, this.#handleFocus, { immediate: true })
    this.watch([this.$hasFocus, this.$index], this.#update, { immediate: true })

    this.selectable.forEach((child, index, children) => {
      child.style.setProperty('--gamepad-row-index', index)
      child.style.setProperty('--gamepad-row-nindex', children.length > 1 ? index / (children.length - 1) : 0)
    })
  }

  beforeDestroy () {
    this.unregister()
  }

  #handleGamepadA = () => {
    if (!this.selection) return
    Voice.speak('a', 'yes')
    ;(this.selection.base ?? this.selection).click()
  }

  #handleGamepadLeft = () => {
    if (!this.$hasFocus.value) return

    this.$index.value = this.props.loop
      ? (Math.max(0, this.$index.value) + this.selectable.length - 1) % this.selectable.length
      : Math.max(0, this.$index.value - 1)
  }

  #handleGamepadRight = () => {
    if (!this.$hasFocus.value) return

    this.$index.value = this.props.loop
      ? (this.$index.value + 1) % this.selectable.length
      : Math.min(this.$index.value + 1, this.selectable.length - 1)
  }

  #handleFocus = () => {
    if (!this.$hasFocus.value) return
    ;(this.props['event-focus'] ?? noop)(this)

    const initial = isSignal(this.props.initial) ? this.props.initial.value : this.props.initial

    // Update index based on opt props.initial
    if (typeof initial === 'number') {
      this.$index.value = initial
      return
    }

    switch (initial) {
      case 'none':
        this.$index.value = -1
        break
      case 'start':
        this.$index.value = 0
        break
      case 'proportional': {
        const lastRow = $ROWS.value?.[$INDEX.previous]
        if (!lastRow) break
        const n = lastRow.$index / (lastRow._collector.components.length - 1)
        this.$index.value = Math.round(n * (this.selectable.length - 1))
        break
      }
      case 'end':
        this.$index.value = this.selectable.length - 1
        break
    }
  }

  #update = () => {
    // Set selection class and scroll into view
    const elements = this.selectable
    let selectedElement = null

    for (let index = 0; index < elements.length; index++) {
      const element = elements[index]

      if (this.$hasFocus.value && index === this.$index.value) {
        element.classList.add('is-selected')

        // Play a random sound
        Voice.speak(['nav', 'blip', 'dop', 'tik', 'vro'], 'nav')

        if (this.props.scroll) {
          scrollIntoViewNearest(element, this.props.scroll)
        }

        selectedElement = element
      } else element.classList.remove('is-selected')
    }

    this.$selection.value = selectedElement
  }
}
