export const DEBUG = (
  new URLSearchParams(window.location.search)
).get('debug')

export const LANGUAGES = [
  { code: 'en', name: 'English', locale: 'en_US' },
  { code: 'fr', name: 'Français', locale: 'fr_FR' },
  { code: 'nl', name: 'Nederlands', locale: 'nl_NL' },
]

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
