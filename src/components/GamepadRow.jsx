import './GamepadRow.scss'

import { Component, Props } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'
import { clamp } from 'missing-math'

import Gamepad from '/controllers/Gamepad'
import scrollIntoViewNearest from '/utils/scroll-into-view-nearest'

const $ROWS = $()
const $INDEX = $(0)

Gamepad.on('up', () => { $INDEX.value = Math.max(0, $INDEX.value - 1) })
Gamepad.on('down', () => { $INDEX.value = Math.min($INDEX.value + 1, $ROWS.value.length - 1) })
$ROWS.subscribe((rows = []) => { $INDEX.value = clamp($INDEX.value, 0, rows.length - 1) })

export default class Row extends Component {
  static $ROWS = $ROWS
  static $INDEX = $INDEX

  static props = {
    initial: Props.enum('start', 'proportional', 'end', 'none'),
    scroll: Props.object
  }

  $index = $(0)
  $hasFocus = $([$ROWS, $INDEX], ([rows = [], index]) => index === rows.indexOf(this))
  $selection = $(null) // currently selected element, or null when none is selected

  template (props) {
    return (
      <section
        class={[
          'gamepad-row',
          props.class,
          { 'has-focus': this.$hasFocus }
        ]}
      >
        {props.children}
      </section>
    )
  }

  get selectable () {
    return Array.from(this.base.querySelectorAll(':scope > *'))
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
      child.style.setProperty('--gamepad-row-nindex', index / (children.length - 1))
    })
  }

  beforeDestroy () {
    this.unregister()
  }

  #handleGamepadA = () => (this.selection?.base ?? this.selection)?.click()

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

    // Update index based on opt props.initial
    switch (this.props.initial) {
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

        if (this.props.scroll) {
          scrollIntoViewNearest(element, this.props.scroll)
        }

        selectedElement = element
      } else element.classList.remove('is-selected')
    }

    this.$selection.value = selectedElement
  }
}
