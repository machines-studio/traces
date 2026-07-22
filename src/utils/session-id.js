// Murmur3 fmix32: bijective integer bit-mixer, so consecutive seconds (as
// produced session to session) scramble into unrelated-looking output
// instead of codes that only differ by 1 in their least-significant digit.
const mix = n => {
  n ^= n >>> 16
  n = Math.imul(n, 0x85ebca6b)
  n ^= n >>> 13
  n = Math.imul(n, 0xc2b2ae35)
  n ^= n >>> 16
  return n >>> 0
}

/**
 * Derives a short, human-readable session id from a ms timestamp seed
 * (e.g. Session.seed), scrambled so consecutive sessions don't produce
 * visually similar codes.
 */
export default seed => mix(Math.round(seed / 1000)).toString(36).toUpperCase()
