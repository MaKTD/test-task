const Axios = require('axios')
const axiosRateLimiter = require('axios-rate-limit')
const http = require('http')

const axios = Axios.create({
  baseURL: 'https://iss.moex.com/iss/',
  timeout: 7000,
  httpAgent: new http.Agent({ keepAlive: true }),
})

const client = axiosRateLimiter(axios, { maxRPS: 1 })

async function loopThroughMoexSource(request, selector) {
  let responseBuffer = []
  let responseColumns = []
  const pageSize = request.params.limit || 100

  let stillHasData = true
  while (stillHasData) {
    // eslint-disable-next-line no-await-in-loop
    const { data: { [selector]: { columns, data } } } = await this.request(request)

    if (request.params.start === 0) {
      responseColumns = columns
    }

    responseBuffer = [...responseBuffer, ...data]

    if (data.length < request.params.limit || data.length === 0) {
      stillHasData = false
    }
    request.params.start += pageSize
  }

  return [responseColumns, responseBuffer]
}

client.loopThroughMoexSource = loopThroughMoexSource.bind(client)

module.exports = client
