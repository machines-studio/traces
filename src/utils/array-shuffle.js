/**
 * Shuffle array in-place
 */
export default (array, prng = Math.random) => {
  let j, x, i
  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(prng() * (i + 1))
    x = array[i]
    array[i] = array[j]
    array[j] = x
  }
  return array
}
