import deepMerge from '/utils/object-deep-merge'

export const DEBUG = (
  new URLSearchParams(window.location.search)
).get('debug') ?? ''

const Config = {}
export default Config

export const loadConfig = async () => {
  deepMerge(Config, await (await fetch('/config.json')).json())

  if (import.meta.env.DEV) {
    const response = await fetch('/config.dev.json')
    if (response.ok) deepMerge(Config, await response.json())
  }

  return Config
}
