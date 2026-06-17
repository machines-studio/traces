// TODO[build] test for translations keys equality

export const translations = {
  en: {
    'introduction.0': 'Hello stranger, welcome to TRACES.\nI’ll be your companion memory',
    'introduction.0.yes': 'tell me more',

    'introduction.1': 'Do you want to conitnue',
    'introduction.1.no': 'what?',
    'introduction.1.yes': 'let’s go',
  },

  fr: {
    'introduction.0': 'Bienvenue à toi, ô visiteur·euse.\nJe serais ton compagnon de mémoire pour cette expérience',
    'introduction.0.yes': 'je t’écoute',
  },

  nl: {
    // TODO[i18n]
  }
}

export default function (key, fallback = key, lang = document.documentElement.lang) {
  return translations[lang][key] ?? fallback
}
