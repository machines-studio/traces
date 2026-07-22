import './Eyes.scss'
import { Component, Props } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'
import { random } from 'missing-math'

import Gamepad from '/controllers/Gamepad'

const IDLE_TIMEOUT = 2000
const IDLE_PAUSE = 1000

const BLINK_DURATION_CLOSE = 90
const BLINK_INTERVAL_MIN = 1000
const BLINK_INTERVAL_MAX = 6000

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export default class Eyes extends Component {
  static props = {
    mirror: [Props.boolean, Props.Signal],
    // Element to look at, or null/undefined to keep the default
    // gamepad/idle-driven behaviour
    lookAt: [Props.Element, Props.Signal]
  }

  $direction = $(0) // -1 left, 0 center, 1 right
  $blink = $(false)
  $mirror = $(this.props.mirror ?? false) // driven externally by the caller
  $lookAt = $(this.props.lookAt ?? null) // driven externally by the caller
  $positionX = $(null) // derived from $lookAt
  $positionY = $(null) // derived from $lookAt

  #eye (id) {
    return (
      <svg viewBox='0 0 170 83' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <defs>
          <filter id={`glow_${id}`} x='-100%' y='-100%' width='300%' height='300%'>
            <feFlood flood-color='#FFF' flood-opacity='0.8' result='glow-color' />
            <feComposite in='glow-color' in2='SourceAlpha' operator='in' result='glow-shape' />
            <feGaussianBlur in='glow-shape' stdDeviation='30' result='glow-blur' />
            <feMerge>
              <feMergeNode in='glow-blur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>
        </defs>

        <mask
          id={`mask0_${id}`} style='mask-type:alpha' maskUnits='userSpaceOnUse' x='1' y='0
        ' width='168' height='83'
        >
          <path
            ref={this.ref(`lid-${id}`)}
            class={['eyes__lid', { 'is-blinking': this.$blink }]}
            d='M86.4719 0.0078125C127.684 0.465279 161.785 21.4127 168.9 48.9346C161.708 68.3064 126.923 83 85.093 83C43.265 83 8.47973 68.3081 1.28634 48.9375C8.47801 21.1082 43.2641 0.00141551 85.093 0.000976562C85.5535 0.000976562 86.0131 0.00426456 86.4719 0.0078125Z'
            fill='white'
          />
        </mask>

        <g filter={`url(#glow_${id})`}>
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
    this.watch(this.$positionX, this.#updatePupil)
    this.watch(this.$positionY, this.#updatePupilY)
    this.watch(this.$mirror, this.#updatePupil)
    this.watch(this.$lookAt, this.#updateLookAt, { immediate: true })
    Gamepad.on('left', this.#handleGamepadLeft)
    Gamepad.on('right', this.#handleGamepadRight)
    window.addEventListener('resize', this.#updateLookAt)
    this.#resetIdleTimer()
    this.#resetBlinkTimer()
  }

  beforeDestroy () {
    Gamepad.off('left', this.#handleGamepadLeft)
    Gamepad.off('right', this.#handleGamepadRight)
    window.removeEventListener('resize', this.#updateLookAt)
    clearTimeout(this.idleTimer)
    clearTimeout(this.idleLoopTimer)
    clearTimeout(this.blinkTimer)
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

  #resetBlinkTimer = () => {
    clearTimeout(this.blinkTimer)
    const delay = random(BLINK_INTERVAL_MIN, BLINK_INTERVAL_MAX)
    this.blinkTimer = setTimeout(this.#blink, delay)
  }

  #blink = () => {
    this.$blink.value = true
    setTimeout(() => { this.$blink.value = false }, BLINK_DURATION_CLOSE)
    this.#resetBlinkTimer()
  }

  #updateLookAt = () => {
    const target = this.$lookAt.value

    if (!target) {
      this.$positionX.value = null
      this.$positionY.value = null
      return
    }

    const eyesRect = this.base.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()

    const eyesCenterX = eyesRect.left + eyesRect.width / 2
    const eyesCenterY = eyesRect.top + eyesRect.height / 2
    const targetCenterX = targetRect.left + targetRect.width / 2
    const targetCenterY = targetRect.top + targetRect.height / 2

    const deltaX = targetCenterX - eyesCenterX
    const deltaY = targetCenterY - eyesCenterY

    // Normalize against the available space on the side the target is on,
    // so the eyes only reach their extreme positions at the actual screen
    // edges, regardless of where Eyes sits on screen.
    const rangeX = deltaX < 0 ? eyesCenterX : window.innerWidth - eyesCenterX
    const rangeY = deltaY < 0 ? eyesCenterY : window.innerHeight - eyesCenterY

    // --position-y's resting range isn't symmetrical (-1 up to 3 down): the
    // pupil's neutral SVG position sits near the top of the eye, so it needs
    // a wider downward range to visually reach the bottom of the eye.
    this.$positionX.value = clamp(rangeX ? deltaX / rangeX : 0, -1, 1)
    this.$positionY.value = clamp(rangeY ? deltaY / rangeY : 0, -1, 1) * (deltaY < 0 ? 1 : 3)
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
