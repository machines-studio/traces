const GRID_CELLS = 30 // active-list search fallback when the grid is too coarse

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
 */
export default (count, minDistance, width, height, isValid = () => true) => {
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
  // rectangular hole) all get a chance to be filled
  for (let attempt = 0; attempt < GRID_CELLS && points.length < count; attempt++) {
    const x = (Math.random() - 0.5) * width
    const y = (Math.random() - 0.5) * height
    if (fits(x, y)) place({ x, y })
  }

  while (active.length && points.length < count) {
    const index = Math.floor(Math.random() * active.length)
    const origin = active[index]
    let placed = false

    for (let attempt = 0; attempt < 30 && points.length < count; attempt++) {
      const angle = Math.random() * Math.PI * 2
      const distance = minDistance + Math.random() * minDistance
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
