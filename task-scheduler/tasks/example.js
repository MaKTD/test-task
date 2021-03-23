/* eslint-disable no-process-exit */

const { parentPort } = require('worker_threads')
const Moex = require('../../dataProviders/moex/index')
const { companies: companiesModel } = require('../../models')
const log = require('../../logger')(module)

function cancel() {
  // now it is dirty exit but it should be graceful with proper request cancel and others
  process.exit(0)
}
process.on('unhandledRejection', (reason, promise) => {
  log.error(`load-tqbr-companies task: unhandled rejection at: ${promise}, reason: ${reason}`)
  process.exit(1)
})

function prepareCompaniesForDb(companies) {
  return companies.map((moexCompany) => {
    const fullName = moexCompany.emitent_title
    const identificationNumber = moexCompany.emitent_inn
    return { fullName, identificationNumber }
  }).filter((company) => !!company.fullName)
}

async function init() {
  try {
    const companies = prepareCompaniesForDb(await Moex.getCompaniesTradingInTQBR())
    return companiesModel.bulkCreate(companies, { ignoreDuplicates: true })
  } catch (error) {
    log.error({ stack: error.stack }, `load-tqbr-companies task: error happened: ${error.name}: ${error.message}`)
    throw error
  }
}

if (parentPort) {
  parentPort.once('message', (message) => {
    if (message === 'cancel') return cancel()
    return true
  });

  (async () => {
    await init()
    process.exit(0)
  })()
} else {
  module.exports = init
}
