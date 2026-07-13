/**
 * Particles are colored circles (using Config.COLORS and utils/array-
 * shuffle, see HomeScreen) laid out around a rectangular mask covering
 * both eyes (--particles-inner-width/height, positioned via .particles
 * itself, see IntroductionScreen.scss), or scattered freely across the
 * whole screen via the `free` prop (see HomeScreen).
 * TODO replace the rectangle mask with the real eyes shape once Stéphane provides it.
 *
 * Target positions are generated with Poisson-disc sampling (see
 * /utils/poisson-disc-sample) so particles are well spread out without
 * overlapping, without the retry-storm a naive rejection sampling would
 * need at high density. Sampling may legitimately settle for fewer than
 * the requested `count` if the shape/spacing can't fit more.
 *
 * They start scattered off-screen (spread across all four sides) and
 * animate in to their settled target after mount, then float gently in
 * place: X and Y each run their own independent animation (@keyframes
 * particle-float-x/y, a variant of sass animations.$float split in two),
 * with their own randomized amplitude/duration/delay, so the idle motion
 * drifts out of phase on both axes instead of a single mechanical
 * diagonal wave. A debug mode (?debug=particles) draws the mask's
 * inner/outer rects.
 *
 * Animation is controlled via the `leaving` prop (boolean or signal) —
 * the caller awaits its transitionend before changing screen (see
 * HomeScreen#handleLanguage). Leaving isn't a fade in place or a return
 * to the entering origin: each particle drifts a short EXIT_DRIFT away
 * from its settled spot while fading out.
 */

import './Particles.scss'
import { Component, Props } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'

import Config from '/controllers/Config'
import shuffle from '/utils/array-shuffle'
import poissonDiscSample from '/utils/poisson-disc-sample'

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
    // Minimum distance kept between two particles' centers, as a multiple
    // of `radius` (e.g. 2 = particles can just touch, 1 = fully overlap)
    minDistance: Props.number,
    floatAmountX: Props.number, // horizontal idle drift amplitude
    floatAmountY: Props.number, // vertical idle drift amplitude
    enterDelay: Props.number, // ms before the first particle starts entering
    enterStagger: Props.number // ms added per particle index on top of enterDelay
  }

  $leaving = $(this.props.leaving ?? false)

  // Fills the layout's bounding box with well-spaced targets via Poisson-
  // disc sampling (see /utils/poisson-disc-sample) — free mode fills a
  // 100x100 box outright, masked mode fills the outer rect while rejecting
  // points that fall within the inner rect (the mask itself)
  #targets (count) {
    const { innerWidth, innerHeight, outerWidth, outerHeight } = Config.PARTICLES
    const radius = this.props.radius ?? Config.PARTICLES.radius
    const minDistance = radius * (this.props.minDistance ?? Config.PARTICLES.minDistance)

    if (this.props.free) return poissonDiscSample(count, minDistance, 100, 100)

    const isOutsideMask = (x, y) => Math.abs(x) >= innerWidth / 2 || Math.abs(y) >= innerHeight / 2
    return poissonDiscSample(count, minDistance, outerWidth, outerHeight, isOutsideMask)
  }

  // Picks a random origin near one of the four edges, on whichever side
  // (top, right, bottom, left) keeps the distribution roughly uniform
  // around the screen instead of piling up on a single edge. The distance
  // from the edge is randomized between -spawnMargin (already inside the
  // screen, so the entering travel distance stays short) and +spawnMargin
  // (off-screen), rather than always starting fully off-screen.
  // .particles__particle is positioned absolute against .particles, itself
  // anchored at the *center* of the screen (see HomeScreen.scss/
  // IntroductionScreen.scss), so coordinates here are relative to that
  // center (roughly -50vw/+50vw, -50vh/+50vh), not to the viewport corner
  #originFor (index) {
    const side = index % 4
    const along = `${(Math.random() - 0.5) * 100}vw`
    const alongV = `${(Math.random() - 0.5) * 100}vh`
    const margin = `${(Math.random() * 2 - 1) * Config.PARTICLES.spawnMargin}px`

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
    const floatAmountX = this.props.floatAmountX ?? Config.PARTICLES.floatAmountX
    const floatAmountY = this.props.floatAmountY ?? Config.PARTICLES.floatAmountY
    const enterDelay = this.props.enterDelay ?? Config.PARTICLES.enterDelay
    const enterStagger = this.props.enterStagger ?? Config.PARTICLES.enterStagger

    // Idle drift on each axis, in vw (an absolute distance, independent of
    // the particle's own tiny size — unlike animations.$float's %, see
    // Particles.scss), randomized per-particle between 0 and the amount so
    // the idle motion doesn't look like a single shared wave
    const particleFloatAmountX = Math.random() * floatAmountX
    const particleFloatAmountY = Math.random() * floatAmountY

    // X and Y run as two separate animations with their own randomized
    // duration/delay (see Particles.scss), so they drift out of phase with
    // one another instead of always peaking together on the same diagonal
    const floatDurationX = 2 + Math.random() * 2
    const floatDurationY = 2 + Math.random() * 2
    const floatDelayX = Math.random() * -3000
    const floatDelayY = Math.random() * -3000

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

  template () {
    const count = this.props.count ?? Config.PARTICLES.count
    const colors = shuffle(Object.keys(Config.COLORS).filter(color => color !== 'vectors'))

    // Poisson-disc sampling may legitimately settle for fewer than `count`
    // targets if the shape/spacing can't fit more — see #targets
    const targets = this.#targets(count)

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
          '--particles-outer-height': `${Config.PARTICLES.outerHeight}vw`
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
      setTimeout(() => this.base.classList.add('is-entered'), this.props.enterDelay ?? Config.PARTICLES.enterDelay)
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
