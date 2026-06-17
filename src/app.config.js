export const DEBUG = (
  new URLSearchParams(window.location.search)
).get('debug')

export const LANGUAGES = [
  { code: 'en', name: 'english', locale: 'en_US' },
  { code: 'fr', name: 'français', locale: 'fr_FR' },
  { code: 'nl', name: 'nederlands', locale: 'nl_NL' },
]

export const COLORS = {
  yellow: '#FC0',
  green: '#00B944',
  blue: '#007FFF',
  red: '#FF4F00',
  pink: '#FF83FE'
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
