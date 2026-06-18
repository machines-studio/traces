const nbsp = '&nbsp;'
export default string => string
  .replace(/(\S)(\s)(\S)$/g, `$1${nbsp}$3`) // Replace space between last word and punctuation
  .replace(/(\S)(\s)(\S+)$/g, `$1${nbsp}$3`) // Replace space between last two words
