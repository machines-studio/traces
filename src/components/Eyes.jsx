import './Eyes.scss'
import { Component, Props } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'

import Gamepad from '/controllers/Gamepad'

const IDLE_TIMEOUT = 2000
const IDLE_PAUSE = 1000

export default class Eyes extends Component {
  static props = {
    mirror: [Props.boolean, Props.Signal],
    // -1 (left) to 1 (right), or null/undefined to keep the default
    // gamepad/idle-driven behaviour
    positionX: [Props.number, Props.Signal],
    // -1 (up) to 1 (down), or null/undefined for no vertical offset
    positionY: [Props.number, Props.Signal]
  }

  $direction = $(0) // -1 left, 0 center, 1 right
  $mirror = $(this.props.mirror ?? false) // driven externally by the caller
  $positionX = $(this.props.positionX ?? null) // driven externally by the caller
  $positionY = $(this.props.positionY ?? null) // driven externally by the caller

  #eye (id) {
    return (
      <svg viewBox='0 0 170 83' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <mask id={`mask0_${id}`} style='mask-type:alpha' maskUnits='userSpaceOnUse' x='1' y='0' width='168' height='83'>
          <path d='M86.4719 0.0078125C127.684 0.465279 161.785 21.4127 168.9 48.9346C161.708 68.3064 126.923 83 85.093 83C43.265 83 8.47973 68.3081 1.28634 48.9375C8.47801 21.1082 43.2641 0.00141551 85.093 0.000976562C85.5535 0.000976562 86.0131 0.00426456 86.4719 0.0078125Z' fill='white' />
        </mask>

        <g mask={`url(#mask0_${id})`}>
          <mask id={`mask1_${id}`} style='mask-type:alpha' maskUnits='userSpaceOnUse' x='0' y='0' width='171' height='120'>
            <path d='M170.342 59.6197C170.342 92.5468 132.21 119.239 85.171 119.239C38.1324 119.239 0 92.5468 0 59.6197C0 26.6927 38.1324 0 85.171 0C132.21 0 170.342 26.6927 170.342 59.6197Z' fill='white' />
          </mask>

          <g class='eyes__blanc' mask={`url(#mask1_${id})`}>
            <path d='M170.341 41.5C170.341 64.4198 132.208 83 85.1698 83C38.1311 83 -0.00125948 64.4198 -0.00125948 41.5C-0.00125948 18.5802 38.1311 0 85.1698 0C132.208 0 170.341 18.5802 170.341 41.5Z' fill='#FFF' />
          </g>

          <circle
            ref={this.ref(`pupil-${id}`)}
            class='eyes__pupil'
            cx='85.171'
            cy='24.0916'
            r='22.91'
            fill='black'
          />
        </g>
      </svg>
    )
  }

  template () {
    return (
      <section class={['eyes', { mirror: this.$mirror }]}>
        <div class='eyes__eye eyes__eye--left'>
          {this.#eye('left')}
        </div>

        <div class='eyes__eye eyes__eye--right'>
          {this.#eye('right')}
        </div>
      </section>
    )
  }

  afterMount () {
    this.watch(this.$direction, this.#updatePupil, { immediate: true })
    this.watch(this.$positionX, this.#updatePupil, { immediate: true })
    this.watch(this.$positionY, this.#updatePupilY, { immediate: true })
    this.watch(this.$mirror, this.#updatePupil)
    Gamepad.on('left', this.#handleGamepadLeft)
    Gamepad.on('right', this.#handleGamepadRight)
    this.#resetIdleTimer()
  }

  beforeDestroy () {
    Gamepad.off('left', this.#handleGamepadLeft)
    Gamepad.off('right', this.#handleGamepadRight)
    clearTimeout(this.idleTimer)
    clearTimeout(this.idleLoopTimer)
  }

  #handleGamepadLeft = () => {
    this.#stopIdleLoop()
    this.$direction.value = -1
    this.#resetIdleTimer()
  }

  #handleGamepadRight = () => {
    this.#stopIdleLoop()
    this.$direction.value = 1
    this.#resetIdleTimer()
  }

  #resetIdleTimer = () => {
    clearTimeout(this.idleTimer)
    this.idleTimer = setTimeout(this.#startIdleLoop, IDLE_TIMEOUT)
  }

  #startIdleLoop = () => {
    const style = getComputedStyle(this.base)
    const duration = parseFloat(style.getPropertyValue('--easing-slow'))

    const next = () => {
      this.$direction.value = this.$direction.value === 1 ? -1 : 1
      this.idleLoopTimer = setTimeout(next, duration + IDLE_PAUSE)
    }

    next()
  }

  #stopIdleLoop = () => {
    clearTimeout(this.idleLoopTimer)
  }

  #updatePupil = () => {
    const position = this.$positionX.value

    if (position === null || position === undefined) {
      const direction = this.$direction.value
      this.refs['pupil-left'].style.removeProperty('--position-x')
      this.refs['pupil-right'].style.removeProperty('--position-x')
      this.refs['pupil-left'].classList.toggle('is-left', direction === -1)
      this.refs['pupil-left'].classList.toggle('is-right', direction === 1)
      this.refs['pupil-right'].classList.toggle('is-left', direction === -1)
      this.refs['pupil-right'].classList.toggle('is-right', direction === 1)
      return
    }

    this.refs['pupil-left'].classList.remove('is-left', 'is-right')
    this.refs['pupil-right'].classList.remove('is-left', 'is-right')
    this.refs['pupil-left'].style.setProperty('--position-x', position)
    this.refs['pupil-right'].style.setProperty('--position-x', this.$mirror.value ? -position : position)
  }

  #updatePupilY = () => {
    const positionY = this.$positionY.value

    if (positionY === null || positionY === undefined) {
      this.refs['pupil-left'].style.removeProperty('--position-y')
      this.refs['pupil-right'].style.removeProperty('--position-y')
      return
    }

    this.refs['pupil-left'].style.setProperty('--position-y', positionY)
    this.refs['pupil-right'].style.setProperty('--position-y', positionY)
  }
}
