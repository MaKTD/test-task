function arrayCombine(keys, values) {
  const result = {}
  const keyCount = keys && keys.length

  if (!Array.isArray(keys)
    || !Array.isArray(values)
    || typeof keyCount !== 'number'
    || keyCount === 0
    || keyCount !== values.length) return false

  keys.forEach((key, index) => {
    result[key] = values[index]
  })

  return result
}

function arrayCombineAll(keys, allValues) {
  const result = []

  if (!Array.isArray(allValues) || !Array.isArray(keys)) return false

  allValues.forEach((value, index) => {
    result[index] = arrayCombine(keys, value)
  })

  return result
}

module.exports = {
  arrayCombine,
  arrayCombineAll,
}
