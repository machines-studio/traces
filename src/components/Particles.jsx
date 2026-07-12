import './Particles.scss'
import { Component, Props } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'

import Config from '/controllers/Config'
import shuffle from '/utils/array-shuffle'

// Minimum distance (in particle radiuses) kept between two target centers,
// so particles don't visually overlap once settled
const MIN_TARGET_DISTANCE = 2.2

// How far (in the same unit as targets, vw/vmax) particles drift away from
// their settled spot when leaving — short on purpose, see #handleLeaving
const EXIT_DRIFT = 6

export default class Particles extends Component {
  static props = {
    // Toggles the leaving animation, caller awaits its transitionend before
    // changing screen (see QuestionScreen.#handleArtwork for the pattern)
    leaving: [Props.boolean, Props.Signal],
    // Scatters particles anywhere on screen instead of around the eyes
    // mask, and fades them out in place when leaving (see HomeScreen)
    free: Props.boolean,
    count: Props.number,
    radius: Props.number,
    floatAmount: Props.number
  }

  $leaving = $(this.props.leaving ?? false)

  // Picks a target point on the rectangular frame around the mask (outside
  // the inner rect, within the outer rect), retrying against every
  // already-placed target so particles don't overlap
  #targetFor (placed) {
    const { innerWidth, innerHeight, outerWidth, outerHeight } = Config.PARTICLES
    const radius = this.props.radius ?? Config.PARTICLES.radius

    let target
    let attempt = 0

    do {
      target = this.props.free
        ? { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100 }
        : this.#pointOnFrame(innerWidth, innerHeight, outerWidth, outerHeight)
      attempt++
    } while (
      attempt < 50 &&
      placed.some(p => Math.hypot(p.x - target.x, p.y - target.y) < radius * MIN_TARGET_DISTANCE)
    )

    return target
  }

  // Uniformly samples a point within the outer rect, then rejects it until
  // it falls outside the inner rect, forming a rectangular "frame" of points
  #pointOnFrame (innerWidth, innerHeight, outerWidth, outerHeight) {
    let x, y

    do {
      x = (Math.random() - 0.5) * outerWidth
      y = (Math.random() - 0.5) * outerHeight
    } while (Math.abs(x) < innerWidth / 2 && Math.abs(y) < innerHeight / 2)

    return { x, y }
  }

  // Picks a random off-screen origin, on whichever side (top, right,
  // bottom, left) keeps the distribution roughly uniform around the screen
  // instead of piling up on a single edge.
  // .particles__particle is positioned absolute against .particles, itself
  // anchored at the *center* of the screen (see HomeScreen.scss/
  // IntroductionScreen.scss), so coordinates here are relative to that
  // center (roughly -50vw/+50vw, -50vh/+50vh), not to the viewport corner
  #originFor (index) {
    const side = index % 4
    const along = `${(Math.random() - 0.5) * 100}vw`
    const alongV = `${(Math.random() - 0.5) * 100}vh`
    const margin = `${Config.PARTICLES.spawnMargin}px`

    return side === 0
      ? { x: along, y: `calc(-50vh - ${margin})` }
      : side === 1
        ? { x: `calc(50vw + ${margin})`, y: alongV }
        : side === 2
          ? { x: along, y: `calc(50vh + ${margin})` }
          : { x: `calc(-50vw - ${margin})`, y: alongV }
  }

  #particle (index, color, target) {
    const origin = this.#originFor(index)
    const unit = this.props.free ? 'vmax' : 'vw'

    return (
      <div
        class='particles__particle'
        data-color={color}
        ref={this.refArray('particles')}
        style={{
          '--particle-target-x': `${target.x}${unit}`,
          '--particle-target-y': `${target.y}${unit}`,
          '--particle-origin-x': origin.x,
          '--particle-origin-y': origin.y,
          '--particle-delay': `${Config.PARTICLES.enterDelay + index * Config.PARTICLES.enterStagger}ms`,
          '--particle-float-delay': `${Math.random() * -3000}ms`
        }}
      />
    )
  }

  template () {
    const total = this.props.count ?? Config.PARTICLES.count
    const colors = shuffle(Object.keys(Config.COLORS).filter(color => color !== 'vectors'))

    const placed = []
    const targets = Array.from({ length: total }, () => {
      const target = this.#targetFor(placed)
      placed.push(target)
      return target
    })

    // Kept around so #handleLeaving can drift away from each particle's
    // settled spot instead of picking a whole new one across the screen
    this.targets = targets

    return (
      <section
        class={['particles', { free: this.props.free }]}
        style={{
          '--particles-radius': `${this.props.radius ?? Config.PARTICLES.radius}vw`,
          '--particles-inner-width': `${Config.PARTICLES.innerWidth}vw`,
          '--particles-inner-height': `${Config.PARTICLES.innerHeight}vw`,
          '--particles-outer-width': `${Config.PARTICLES.outerWidth}vw`,
          '--particles-outer-height': `${Config.PARTICLES.outerHeight}vw`,
          '--animation-float-amount': `${this.props.floatAmount ?? Config.PARTICLES.floatAmount}%`
        }}
      >
        {targets.map((target, index) => this.#particle(index, colors[index % colors.length], target))}
      </section>
    )
  }

  afterMount () {
    // Trigger the enter transition (origin -> target) after mount, once the
    // starting `top`/`left` values above have been painted, so the browser
    // actually animates the move instead of skipping straight to target
    requestAnimationFrame(() => {
      setTimeout(() => this.base.classList.add('is-entered'), Config.PARTICLES.enterDelay)
    })

    this.watch(this.$leaving, this.#handleLeaving)
  }

  // Drifts each particle a short distance away from its settled spot, in a
  // random direction, rather than sending it back to its entering origin
  // or picking a whole new spot across the screen (kept quick and subtle so
  // it doesn't drag out the screen transition). Styles are set before
  // toggling the class by hand (rather than binding the class reactively
  // to $leaving in the template), so the transition never starts a frame
  // early from the old (entering) target position
  #handleLeaving = leaving => {
    if (!leaving) return

    const unit = this.props.free ? 'vmax' : 'vw'

    this.refs.particles?.forEach((particle, index) => {
      const settled = this.targets[index]
      const angle = Math.random() * Math.PI * 2

      particle.style.setProperty('--particle-target-x', `${settled.x + Math.cos(angle) * EXIT_DRIFT}${unit}`)
      particle.style.setProperty('--particle-target-y', `${settled.y + Math.sin(angle) * EXIT_DRIFT}${unit}`)
    })

    this.base.classList.add('is-leaving')
  }
}
