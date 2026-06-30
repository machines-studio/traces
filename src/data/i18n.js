// TODO[build] test for translations keys equality

import { LANGUAGES } from '/app.config'

export const translations = {
  en: {
    'introduction.0': 'Hello stranger, welcome to TRACES.\nI’ll be your companion memory',
    'introduction.0.next': 'tell me more',
    'introduction.1': 'Do you want to continue?',
    'introduction.1.prev': 'sorry, who are you?',
    'introduction.1.next': 'let’s go',
  },

  fr: {
    'introduction.0': 'Bienvenue à toi, ô visiteur·euse.\nJe serais ton compagnon de mémoire pour cette expérience',
    'introduction.0.next': 'je t’écoute',
    'introduction.1': 'Tu vas vivre une expérience unique et magnifique',
    'introduction.1.next': 'continuer',
    'introduction.2': 'Je vais te poser des questions auxquelles tu vas devoir répondre',
    'introduction.2.next': 'j’accepte la mission',
  },

  nl: {
    // TODO[I18N]
  }
}

const I18N = (key, fallback = key, lang = document.documentElement.lang) => translations[lang]?.[key] ?? fallback
I18N.translate = (translations, lang = document.documentElement.lang) =>
  typeof translations === 'object'
    ? translations[lang]
    : translations

I18N.date = (timestamp, lang = document.documentElement.lang) =>
  new Intl.DateTimeFormat(lang, LANGUAGES.find(({ code }) => code === lang)?.date).format(new Date(timestamp))

export default I18N
