/**
 * Mulberry32: returns a seeded PRNG function `() => float in [0, 1)`, a
 * drop-in replacement for `Math.random` (e.g. as the `rng` arg of
 * `missing-math`'s `random`/`randomInt`, or `poisson-disc-sample`'s
 * `rng` param) that produces the same sequence for the same seed.
 */
export default seed => {
  let state = seed | 0

  return () => {
    state = (state + 0x6D2B79F5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
