import Config from '/controllers/Config'
import Session from '/controllers/Session'

export const translations = {}

export const loadTranslations = async () => {
  const codes = Config.LANGUAGES

  const languages = await Promise.all(
    codes.map(code => fetch(`/languages/${code}.json`).then(res => res.json()))
  )

  languages.forEach(({ translations: t }, i) => { translations[codes[i]] = t })

  // Replace the codes-only list with full language descriptors (name, locale, date)
  Config.LANGUAGES = languages.map(({ translations: t, ...language }, i) => ({
    code: codes[i],
    ...language
  }))
}

const I18N = (key, vars = {}, fallback = key) => {
  const text = translations[Session.$lang.value]?.[key] ?? fallback
  return typeof text === 'string'
    ? text.replace(/{{\s*(\w+)\s*}}/g, (match, name) => vars[name] ?? match)
    : text
}

I18N.resolve = translations => {
  return typeof translations === 'object'
    ? translations[Session.$lang.value]
    : translations
}

I18N.date = timestamp => {
  const lang = Session.$lang.value
  return new Intl.DateTimeFormat(lang, Config.LANGUAGES.find(({ code }) => code === lang)?.date)
    .format(new Date(timestamp))
}

export default I18N
