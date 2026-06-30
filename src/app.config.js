export const DEBUG = (
  new URLSearchParams(window.location.search)
).get('debug')

export const LANGUAGES = [
  { code: 'en', name: 'english', locale: 'en_US', date: { year: 'numeric', month: 'long', day: 'numeric' } },
  { code: 'fr', name: 'français', locale: 'fr_FR', date: { year: 'numeric', month: 'long', day: 'numeric' } },
  { code: 'nl', name: 'nederlands', locale: 'nl_NL', date: { year: 'numeric', month: 'long', day: 'numeric' } },
]

export const COLORS = {
  yellow: '#FC0',
  green: '#00B944',
  blue: '#007FFF',
  red: '#FF4F00',
  pink: '#FF83FE',

  // Assign a color to each vector
  vectors: {
    type: 'green',
    emotion: 'red',
    date: 'yellow',
    description: 'blue'
  }
}

export const TESTIMONY = {
  scrollDelay: 500, // ms, before marquee starts
  scrollSpeed: 40, // px/s, marquee
  manualScrollDuration: 600, // ms, gamepad left/right
  manualScrollStep: 200 // px per gamepad left/right press
}

export const GAMEPAD = {
  buttons: {
    a: 10,
    b: 11
  },

  axes: {
    x: 0,
    y: 1,
    invertX: true,
    invertY: true
  }
}
