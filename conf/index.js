const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })
const nconf = require('nconf')
const defaultConf = require('./defaults')
const packageJson = require('../package.json')

function makeConf() {
  nconf.env({
    separator: '__',
    parseValues: true,
  })
  nconf.argv({
    parseValues: true,
  })
  nconf.defaults(defaultConf)

  nconf.set('appVersion', packageJson.version)
  nconf.set('appName', packageJson.name)

  nconf.required([
    'NODE_ENV',
    'DATABASE_URL',
  ])

  return nconf
}

module.exports = makeConf()
