export const DEBUG = (
  new URLSearchParams(window.location.search)
).get('debug') ?? ''

const Config = {}
export default Config

export const loadConfig = async () =>
  Object.assign(Config, await (await fetch('/config.json')).json())
