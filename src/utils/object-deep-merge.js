const isPlainObject = value => value?.constructor === Object

export default function deepMerge (target, source) {
  for (const key in source) {
    target[key] = isPlainObject(source[key]) && isPlainObject(target[key])
      ? deepMerge(target[key], source[key])
      : source[key]
  }
  return target
}
