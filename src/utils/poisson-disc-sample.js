import { random, randomInt } from 'missing-math'

const GRID_CELLS = 30 // active-list search fallback when the grid is too coarse
const SEED_CANDIDATES = 8 // candidates per seed attempt; higher = stronger center bias

/**
 * Bridson's Poisson-disc sampling: fills a `width` x `height` box (centered
 * on 0,0) with up to `count` points that are all at least `minDistance`
 * apart, growing outward from random seed points via an active list. Pass
 * `isValid(x, y)` to reject points outside an arbitrary shape (e.g. a hole,
 * a circle) without breaking the minimum-distance guarantee.
 *
 * Unlike naive rejection sampling, placement never needs to retry against
 * every previous point — but it may legitimately place fewer than `count`
 * points if the shape/spacing can't fit more; the caller decides how (or
 * whether) to make up the difference.
 *
 * Pass `rng` (a `() => float in [0, 1)` function, e.g. from
 * `/utils/random-seeded`) to get a reproducible layout instead of the
 * default `Math.random`.
 *
 * By default the fill is biased toward the center of the box (so a `count`
 * that doesn't saturate the box still reads as one centered cluster rather
 * than drifting off-center). Pass `centered: false` for a plain, uniformly
 * scattered fill across the whole box instead.
 */
export default (count, minDistance, width, height, isValid = () => true, rng = Math.random, { centered = true } = {}) => {
  const cellSize = minDistance / Math.SQRT2
  const cols = Math.ceil(width / cellSize)
  const rows = Math.ceil(height / cellSize)
  const grid = new Array(cols * rows).fill(null)

  const toCell = (x, y) => ({
    col: Math.floor((x + width / 2) / cellSize),
    row: Math.floor((y + height / 2) / cellSize)
  })

  const fits = (x, y) => {
    if (x < -width / 2 || x > width / 2 || y < -height / 2 || y > height / 2) return false
    if (!isValid(x, y)) return false

    const { col, row } = toCell(x, y)
    for (let r = Math.max(0, row - 2); r <= Math.min(rows - 1, row + 2); r++) {
      for (let c = Math.max(0, col - 2); c <= Math.min(cols - 1, col + 2); c++) {
        const neighbor = grid[r * cols + c]
        if (neighbor && Math.hypot(neighbor.x - x, neighbor.y - y) < minDistance) return false
      }
    }
    return true
  }

  const place = point => {
    const { col, row } = toCell(point.x, point.y)
    grid[row * cols + col] = point
    points.push(point)
    active.push(point)
  }

  const points = []
  const active = []

  // Seed with random attempts across the whole box (rather than a single
  // center seed), so disconnected valid regions (e.g. either side of a
  // rectangular hole) all get a chance to be filled. When `centered`, each
  // attempt draws several candidates and keeps the one closest to center,
  // biasing the fill toward the middle of the box without giving up
  // coverage of the full box when `count` is large enough to need it
  for (let attempt = 0; attempt < GRID_CELLS && points.length < count; attempt++) {
    let best = null
    for (let c = 0; c < (centered ? SEED_CANDIDATES : 1); c++) {
      const x = random(-width / 2, width / 2, rng)
      const y = random(-height / 2, height / 2, rng)
      if (!fits(x, y)) continue
      if (!best || Math.hypot(x, y) < Math.hypot(best.x, best.y)) best = { x, y }
    }
    if (best) place(best)
  }

  while (active.length && points.length < count) {
    // When `centered`, grow from whichever of a few random candidates is
    // closest to center, so the cluster fills inside-out rather than
    // branching outward evenly in all directions
    let index = randomInt(0, active.length, rng)
    for (let c = 1; c < (centered ? SEED_CANDIDATES : 1); c++) {
      const candidate = randomInt(0, active.length, rng)
      if (Math.hypot(active[candidate].x, active[candidate].y) < Math.hypot(active[index].x, active[index].y)) index = candidate
    }
    const origin = active[index]
    let placed = false

    for (let attempt = 0; attempt < 30 && points.length < count; attempt++) {
      const angle = random(Math.PI * 2, undefined, rng)
      const distance = minDistance + random(minDistance, undefined, rng)
      const x = origin.x + Math.cos(angle) * distance
      const y = origin.y + Math.sin(angle) * distance

      if (fits(x, y)) {
        place({ x, y })
        placed = true
      }
    }

    if (!placed) active.splice(index, 1)
  }

  return points
}
