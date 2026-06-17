export const translations = {
  en: {
    'introduction.debug': 'Hello stranger, welcome to TRACES.\nI’ll be your companion memory',
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
