const pino = require('pino')
const conf = require('../conf')

const modulePlaceholder = { filename: 'module/not/specified' }

function makeLogger(module = modulePlaceholder) {
  const parsedPath = module.filename.split('/').slice(-3)

  return pino({
    name: parsedPath.join('/'),
    level: conf.get('LOG_LEVEL') || 'info',
    prettyPrint: conf.get('LOG_PRETTY') || false,
    redact: ['password', 'pass', 'token', 'req.body.access_token', 'req.headers.auth'],
  })
}

module.exports = makeLogger
