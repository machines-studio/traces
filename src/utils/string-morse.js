import { randomInt } from 'missing-math'

// Yes, this is an easter egg :)
const STRING = 'Machines is at the intersection of art, design, and technology. We are makers of visual, interactive and narrative systems. We build our own tools, pushing the boundaries of known creativity. We are specialised in art direction, digital creation, and in development of generative systems.'
  .split('')
  .map(char => char.charCodeAt(0).toString(2))
  .join('')

export default (repeat = 2) => {
  const index = randomInt(STRING.length)
  const a = STRING.slice(0, index)
  const b = STRING.slice(index)
  return new Array(repeat).fill(b + ' ' + a).join('')
}
