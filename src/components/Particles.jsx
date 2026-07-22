/**
 * Coordinate system: widths (outerWidth/innerRadiusX/radius/spawnMargin/
 * floatAmountX/exitDrift's X component) are in vw, heights (outerHeight/
 * innerRadiusY/floatAmountY/exitDrift's Y component) are in vh — each axis
 * uses its own native viewport unit, no cross-axis conversion. Poisson-disc
 * minDistance is therefore not the same physical spacing on both axes
 * unless the box happens to be square.
 */

import './Particles.scss'
import { Component, Props } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'
import { random } from 'missing-math'

import Config from '/controllers/Config'
import shuffle from '/utils/array-shuffle'
import poissonDiscSample from '/utils/poisson-disc-sample'

export default class Particles extends Component {
  static props = {
    // Gates when particles start entering (origin -> target). Omit to start
    // immediately on mount
    entering: [Props.boolean, Props.Signal],
    leaving: [Props.boolean, Props.Signal],
    outerWidth: Props.required(Props.number),
    outerHeight: Props.required(Props.number),
    // Cuts an elliptical hole out of the outer box (e.g. IntroductionScreen's
    // eyes mask). Omit for a plain full-box scatter (HomeScreen, ConstellationScreen)
    innerRadiusX: Props.number,
    innerRadiusY: Props.number,
    // Shifts the hole's center away from the outer box's center. Defaults to 0
    innerOffsetX: Props.number,
    innerOffsetY: Props.number,
    // No shared default across screens — callers spread a preset from
    // Config.PARTICLES.presets (see e.g. HomeScreen)
    count: Props.required(Props.number),
    // Uniformly scattered across the outer box instead of the default
    // center-biased fill (see /utils/poisson-disc-sample). Used by presets
    // like `home` that want the old edge-to-edge scatter
    scattered: Props.boolean,
    radius: Props.required(Props.number),
    // Multiple of `radius` kept between two particles' centers
    minDistance: Props.required(Props.number),
    // How far outside the outer box's edge origins spawn (applied as vw on
    // X, vh on Y). Defaults to 0 (origins spawn right at the box's edge)
    spawnMargin: Props.number,
    floatAmountX: Props.required(Props.number),
    floatAmountY: Props.required(Props.number),
    // ms before the first particle starts entering. Defaults to 0
    enterDelay: Props.number,
    // ms added per particle index on top of enterDelay. Defaults to 0
    enterStagger: Props.number,
    // Distance drifted away from the settled spot when leaving
    // (applied as vw on X, vh on Y). Defaults to 0 (fades out in place)
    exitDrift: Props.number
  }

  $entering = $(this.props.entering ?? true)
  $leaving = $(this.props.leaving ?? false)

  #targets (count) {
    const innerRadiusX = this.props.innerRadiusX ?? 0
    const innerRadiusY = this.props.innerRadiusY ?? 0
    const innerOffsetX = this.props.innerOffsetX ?? 0
    const innerOffsetY = this.props.innerOffsetY ?? 0
    const minDistance = this.props.radius * this.props.minDistance

    const isOutsideMask = (x, y) => innerRadiusX <= 0 || innerRadiusY <= 0 || ((x - innerOffsetX) / innerRadiusX) ** 2 + ((y - innerOffsetY) / innerRadiusY) ** 2 >= 1
    const centered = !this.props.scattered
    return poissonDiscSample(count, minDistance, this.props.outerWidth, this.props.outerHeight, isOutsideMask, Math.random, { centered })
  }

  // Edge is picked closest to the particle's own target, so it travels
  // straight in from the nearest border instead of potentially crossing the
  // whole box (and other particles' paths) from a far one
  #originFor (target) {
    const distanceToEdge = {
      top: this.props.outerHeight / 2 + target.y,
      right: this.props.outerWidth / 2 - target.x,
      bottom: this.props.outerHeight / 2 - target.y,
      left: this.props.outerWidth / 2 + target.x
    }
    const side = Object.keys(distanceToEdge).reduce((a, b) => distanceToEdge[a] < distanceToEdge[b] ? a : b)

    const alongX = `${random(-50, 50)}vw`
    const alongY = `${random(-50, 50)}vh`
    const spawnMargin = this.props.spawnMargin ?? 0
    const marginX = `${spawnMargin}vw`
    const marginY = `${spawnMargin}vh`

    return side === 'top'
      ? { x: alongX, y: `calc(-50vh - ${marginY})` }
      : side === 'right'
        ? { x: `calc(50vw + ${marginX})`, y: alongY }
        : side === 'bottom'
          ? { x: alongX, y: `calc(50vh + ${marginY})` }
          : { x: `calc(-50vw - ${marginX})`, y: alongY }
  }

  #particle (index, color, target) {
    const origin = this.#originFor(target)
    const enterDelay = this.props.enterDelay ?? 0
    const enterStagger = this.props.enterStagger ?? 0

    const particleFloatAmountX = random(this.props.floatAmountX)
    const particleFloatAmountY = random(this.props.floatAmountY)

    // Two separate animations (see Particles.scss) so X/Y drift out of phase
    const floatDurationX = random(2, 4)
    const floatDurationY = random(2, 4)
    const floatDelayX = random(-3000, 0)
    const floatDelayY = random(-3000, 0)

    return (
      <div
        class='particles__particle'
        data-color={color}
        ref={this.refArray('particles')}
        style={{
          '--particle-target-x': `${target.x}vw`,
          '--particle-target-y': `${target.y}vh`,
          '--particle-origin-x': origin.x,
          '--particle-origin-y': origin.y,
          '--particle-float-amount-x': `${particleFloatAmountX}vw`,
          '--particle-float-amount-y': `${particleFloatAmountY}vw`,
          '--particle-float-duration-x': `${floatDurationX}s`,
          '--particle-float-duration-y': `${floatDurationY}s`,
          '--particle-float-delay-x': `${floatDelayX}ms`,
          '--particle-float-delay-y': `${floatDelayY}ms`,
          '--particle-delay': `${enterDelay + index * enterStagger}ms`
        }}
      />
    )
  }

  template ({ count, radius, outerWidth, outerHeight, innerRadiusX = 0, innerRadiusY = 0, innerOffsetX = 0, innerOffsetY = 0 }) {
    const colors = shuffle(Object.keys(Config.COLORS).filter(color => color !== 'vectors'))

    const targets = this.#targets(count)
    // Kept around so #handleLeaving can drift away from each particle's
    // settled spot instead of picking a whole new one
    this.targets = targets

    return (
      <section
        class='particles'
        style={{
          '--particles-radius': `${radius}vw`,
          '--particles-inner-radius-x': `${innerRadiusX}vw`,
          '--particles-inner-radius-y': `${innerRadiusY}vh`,
          '--particles-inner-offset-x': `${innerOffsetX}vw`,
          '--particles-inner-offset-y': `${innerOffsetY}vh`,
          '--particles-outer-width': `${outerWidth}vw`,
          '--particles-outer-height': `${outerHeight}vh`
        }}
      >
        {targets.map((target, index) => this.#particle(index, colors[index % colors.length], target))}
      </section>
    )
  }

  afterMount () {
    this.watch(this.$entering, this.#handleEntering, { immediate: true })
    this.watch(this.$leaving, this.#handleLeaving)
  }

  // Trigger the enter transition (origin -> target) once entering starts,
  // after the starting `top`/`left` values above have been painted, so the
  // browser actually animates the move instead of skipping straight to
  // target. No `leaving`-style prop passed means entering starts immediately
  #handleEntering = entering => {
    if (!entering) return

    requestAnimationFrame(() => {
      setTimeout(() => this.base.classList.add('is-entered'), this.props.enterDelay ?? 0)
    })
  }

  // Drifts each particle a short distance away from its settled spot in a
  // random direction, rather than back to its entering origin or a whole
  // new spot. Styles are set before toggling the class by hand so the
  // transition doesn't start a frame early from the old target position
  #handleLeaving = leaving => {
    if (!leaving) return

    const exitDrift = this.props.exitDrift ?? 0

    this.refs.particles?.forEach((particle, index) => {
      const settled = this.targets[index]
      const angle = random(Math.PI * 2)

      particle.style.setProperty('--particle-target-x', `${settled.x + Math.cos(angle) * exitDrift}vw`)
      particle.style.setProperty('--particle-target-y', `${settled.y + Math.sin(angle) * exitDrift}vh`)
    })

    this.base.classList.add('is-leaving')
  }
}
