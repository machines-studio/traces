import './Constellation.scss'
import { Component, Props } from '@tooooools/ui'

import Artwork from '/components/Artwork'
import poissonDiscSample from '/utils/poisson-disc-sample'
import randomSeeded from '/utils/random-seeded'

const LAYOUT_SCALE = 6 // layout box size, as a multiple of artwork size
const MIN_DISTANCE = 1.6
const LINKS_PER_ARTWORK = 2 // nearest neighbors each artwork links to

export default class Constellation extends Component {
  static props = {
    seed: Props.required(Props.number),
    length: Props.required(Props.number),
    artworks: Props.required(Props.array),
    fill: Props.boolean
  }

  // Derived from seed+length only (never artworks), so slots don't move as the trace fills up
  #layout (seed, length) {
    const rng = randomSeeded(seed)
    const size = 100 / LAYOUT_SCALE
    const points = poissonDiscSample(length, size * MIN_DISTANCE, 100, 100, () => true, rng, { centered: false })

    // poissonDiscSample can place fewer than `length` points if it doesn't fit
    while (points.length < length) points.push({ x: 0, y: 0 })

    return this.#recenter(points, this.props.fill ?? false)
  }

  // poissonDiscSample's placements rarely use the full box evenly, leaving a
  // cluster that's both off-center and padded by empty margin around its
  // bounding box; recenter on (0, 0), then (if `fill`) scale up so the bbox
  // itself spans the full [-50, 50] range (uniformly, to keep relative
  // spacing intact)
  #recenter (points, fill) {
    const xs = points.map(({ x }) => x)
    const ys = points.map(({ y }) => y)
    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2
    const centerY = (Math.min(...ys) + Math.max(...ys)) / 2
    const halfWidth = (Math.max(...xs) - Math.min(...xs)) / 2
    const halfHeight = (Math.max(...ys) - Math.min(...ys)) / 2
    const scale = fill && halfWidth && halfHeight ? Math.min(50 / halfWidth, 50 / halfHeight) : 1

    return points.map(({ x, y }) => ({ x: (x - centerX) * scale, y: (y - centerY) * scale }))
  }

  #links (slots) {
    const links = []
    const seen = new Set()

    slots.forEach((slot, index) => {
      const neighbors = slots
        .map((other, otherIndex) => ({ index: otherIndex, distance: Math.hypot(other.x - slot.x, other.y - slot.y) }))
        .filter(({ index: otherIndex }) => otherIndex !== index)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, LINKS_PER_ARTWORK)

      neighbors.forEach(({ index: otherIndex }) => {
        const key = [index, otherIndex].sort().join('-')
        if (seen.has(key)) return
        seen.add(key)
        links.push([{ ...slot, index }, { ...slots[otherIndex], index: otherIndex }])
      })
    })

    return links
  }

  #artwork (slot, artwork, isSelected) {
    const style = {
      '--constellation-artwork-x': `${slot.x}%`,
      '--constellation-artwork-y': `${slot.y}%`
    }

    return [
      <div class='constellation__slot' style={style} />,
      (artwork &&
        <Artwork
          {...artwork}
          style={style}
          class={{
            'is-discovered': true,
            'is-selected': isSelected
          }}
        />
      )
    ]
  }

  template ({ seed, length, artworks }) {
    const slots = this.#layout(seed, length)
    const links = this.#links(slots)

    return (
      <section class='constellation'>
        <svg
          class='constellation__links'
          viewBox='0 0 100 100'
          preserveAspectRatio='none'
        >
          {
            links.map(([from, to]) => (
              <line
                class={{
                  'is-discovered': !!artworks[from.index]?.artwork && !!artworks[to.index]?.artwork
                }}
                x1={50 + from.x} y1={50 + from.y}
                x2={50 + to.x} y2={50 + to.y}
                stroke='currentcolor'
              />
            ))
          }
        </svg>

        <div class='constellation__artworks'>
          {slots.map((slot, index) => this.#artwork(slot, artworks[index]?.artwork, index === artworks.length - 1))}
        </div>
      </section>
    )
  }
}
