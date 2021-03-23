const requireAll = require('require-all')
const { Sequelize, DataTypes } = require('sequelize')
const conf = require('../conf')
const log = require('../logger')(module)

const models = requireAll({
  dirname: __dirname,
  filter: (fileName) => (fileName !== 'index.js' ? fileName : false),
})

const db = {
  Sequelize,
  get dbOptions() {
    const databaseOptions = {
      logging(str) {
        log.debug(`DB query: ${str}`)
      },
      pool: {
        maxConnections: conf.get('DATABASE_MAX_CONNECTIONS') || 10,
        minConnections: conf.get('DATABASE_MIN_CONNECTIONS') || 1,
      },
      dialect: 'postgres',
      dialectOptions: {},
    }

    if (conf.get('DATABASE_SSL')) {
      const rejectUnauthorized = conf.get('DATABASE_REJECT_UNAUTHORIZED')
      if (rejectUnauthorized) {
        databaseOptions.dialectOptions.ssl = { rejectUnauthorized: false }
      } else {
        databaseOptions.dialectOptions.ssl = true
      }
    }

    return databaseOptions
  },
  get dbUrl() {
    if (!conf.get('DATABASE_URL')) {
      throw new Error('Cannot connect to the database. Please declare the DATABASE_URL environment variable with the correct database connection string.')
    }
    return conf.get('DATABASE_URL')
  },
  get sequelize() {
    return this._client
  },

  makeClient() {
    if (!this._client) {
      this._client = new Sequelize(this.dbUrl, this.dbOptions)
    }
    return this._client
  },

  loadModels() {
    try {
      Object.values(models).forEach((modelFactory) => {
        const model = modelFactory(this._client, DataTypes)
        this[model.name] = model
      })
      Object.values(this)
        .filter((prop) => typeof prop === 'function' && typeof prop.associate === 'function')
        .forEach((model) => {
          model.associate(this)
        })
    } catch (error) {
      log.error(error, `Model creation error: ${error.message}`)
    }
  },

  init() {
    log.info('starting db initializing...')
    this.makeClient()
    this.loadModels()
    log.info('db models successfully initialized')
  },
}

db.init()
module.exports = db
