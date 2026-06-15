export const translations = {
  en: {
    'introduction.debug': 'This is English',
  },

  fr: {
    'introduction.debug': 'C’est du Français',
  },

  nl: {
    'introduction.debug': 'Dutch'
  }
}

export default function (key, lang = document.documentElement.lang) {
  return translations[lang][key] ?? key
}
