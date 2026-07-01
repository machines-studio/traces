/**
 * TODO[particles]
 *
 * Particles are SVG circles of random colors (using Config.COLORS and
 * utils/array-shuffle, see HomeScreen).
 *
 * They are randomly distributed outside the viewport (but not too naively so
 * that distribution is more or less uniform).
 *
 * They have a target position around a collision mask with a specific shape,
 * which will visually wrap around the eyes (ask Stéphane for the shape). I
 * think the simpler way of handling this mask position relative to the eyes is
 * with CSS positioning, no need to take into account the eyes real positions.
 * A debug mode (using Config.debug) may be useful to see the underlying mask
 * during development.
 *
 * Ideally, no overlapping should occur between particles, but this may be
 * tricky if they are animated only without a physic engine.
 *
 * They move from their origin to their target, either using a basic physics
 * engine with collision, or are simply by being animated along a path.
 *
 * Once arrived to their target, they can float (using sass animations.$float)
 *
 * Animation is controlled via Props.Signal and/or a class, this component is
 * designed to be mainly used in IntroductionScreen by may be used somewhere
 * else in a later stage. Entering animation will be done at component mount,
 * with a slight delay, and exit animation before changing
 * HomeScreen.props.screen.value (see QuestionScreen.#handleArtwork for a
 * possible implementation of delaying screen transition)
 *
 * All constants should be placed inside the config.json file.
 */

import './Particles.scss'
import { Component, Props } from '@tooooools/ui'

import Config from '/controllers/Config'

export default class Particles extends Component {
  static props = {}

  template () {
    return (
      <section class='particles' />
    )
  }
}
