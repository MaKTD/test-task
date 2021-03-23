const dayjs = require('dayjs')
const { arrayCombine, arrayCombineAll } = require('../../helpers/arrayCombine')
const client = require('./client')

class Moex {
  static get client() {
    return client
  }

  static mapResponse(columns, data) {
    if (data && data.length === 1) {
      return arrayCombine(columns, data[0])
    }
    if (data && data.length > 1) {
      return arrayCombineAll(columns, data)
    }
    return data
  }

  static mapAllCompaniesFromSecuritiesSpecs(securities) {
    return securities.map((security) => this.mapCompanyFromSecuritySpec(security))
  }

  static mapCompanyFromSecuritySpec(security) {
    const companiesKeys = ['secid', 'emitent_id', 'emitent_title', 'emitent_inn', 'emitent_okpo']
    return Object.fromEntries(
      Object.entries(security).filter((securityEntry) => companiesKeys.includes(securityEntry[0])),
    )
  }

  static async getCompaniesTradingInTQBR() {
    const securities = await this.getTradedSharesSpecsInTQBR()
    return this.mapAllCompaniesFromSecuritiesSpecs(securities)
  }

  static async getTradedSharesSpecsInTQBR() {
    return this.getSecuritiesSpecsInBoard('TQBR', 'stock', 'shares', { status: 'traded' })
  }

  static async getSecuritiesSpecsInBoard(board, engine, market, opts = {}) {
    const securitiesListing = await this.getSecuritiesListingIn(board, engine, market, opts)

    const tickers = securitiesListing.map((security) => security.SECID)

    return this.getSecuritiesSpec(tickers, engine, market, opts)
  }

  static async getSharesSpec(tickers) {
    return this.getSecuritiesSpec(tickers, 'stock', 'shares')
  }

  static async getShareSpecByTickerStrict(ticker) {
    const matchedShares = await this.getSecuritySpec(ticker, 'stock', 'shares', { limit: 100 })
    if (!Array.isArray(matchedShares) && typeof matchedShares === 'object' && matchedShares.secid === ticker) return matchedShares
    return matchedShares.find((matchedShare) => matchedShare.secid === ticker) || {}
  }

  static async getShareSpec(ticker) {
    return this.getSecuritySpec(ticker, 'stock', 'shares')
  }

  static async getSecuritiesSpec(tickers, engine, market, opts = {}) {
    const result = []

    // eslint-disable-next-line no-restricted-syntax
    for (const ticker of tickers) {
      // eslint-disable-next-line no-await-in-loop
      result.push(await this.getSecuritySpec(ticker, engine, market, opts))
    }

    return result
  }

  static async getSecuritySpec(ticker, engine, market, opts = {}) {
    const request = {
      url: '/securities.json',
      params: {
        q: ticker,
        engine,
        market,
        lang: opts.lang || 'ru',
        start: opts.start || 0,
        limit: opts.limit || 1,
        is_trading: opts.isTrading,
        group_by: opts.groupBy,
        group_by_filter: opts.groupByFilter,
      },
    }

    const { data: { securities: { columns, data } } } = await client.request(request)
    return this.mapResponse(columns, data)
  }

  static async getSharesHistoryInTQBRFor(date = undefined) {
    return this.getSecuritiesHistoryInBoard('TQBR', 'stock', 'shares', 'total', { date })
  }

  static async getOneShareMonthlyHistoryInTQBRInRange(ticker, from, till) {
    const [columns, data] = await this.getOneShareMonthlyHistoryInBoard(ticker, 'TQBR', 'stock', 'shares', 'total', { from, till })
    return this.mapResponse(columns, data)
  }

  static async getOneShareMonthlyHistoryInBoard(ticker, board, engine, market, session, opts = {}) {
    const [columns, data] = await this
      .getSecurityHistoryInBoard(ticker, board, engine, market, session, opts)

    const [, filteredData] = this.filterSecuritiesQuotesMonthly(columns, data)

    return [columns, filteredData]
  }

  static filterSecuritiesQuotesMonthly(columns, data) {
    const dateIndex = columns.indexOf('TRADEDATE')
    const closePriceIndex = columns.indexOf('CLOSE')
    const YEAR = 0
    const MONTH = 1
    const DAY = 2

    if (dateIndex === -1) throw new Error('can not find TRADEDATE index')
    if (closePriceIndex === -1) throw new Error('can not find CLOSE PRICE index')
    const monthlyFilteredQuotes = data.filter((quote, index, dataArr) => {
      if (!quote[closePriceIndex]) return false
      const currentDate = quote[dateIndex].split('-')

      const earlierDateInThisMonth = dataArr.find((compareQuote) => {
        const date = compareQuote[dateIndex].split('-')
        return currentDate[YEAR] === date[YEAR]
          && currentDate[MONTH] === date[MONTH]
          && currentDate[DAY] > date[DAY]
          && compareQuote[closePriceIndex]
      })
      return !earlierDateInThisMonth
    })

    return [columns, monthlyFilteredQuotes]
  }

  static async getOneShareHistoryInTQBRInRange(ticker, from, till) {
    const [columns, data] = await this.getSecurityHistoryInBoard(ticker, 'TQBR', 'stock', 'shares', 'total', { from, till })
    return this.mapResponse(columns, data)
  }

  static async getSecurityHistoryInBoard(ticker, board, engine, market, session, opts = {}) {
    const request = {
      url: `/history/engines/${engine}/markets/${market}/sessions/${session}/boards/${board}/securities/${ticker}.json`,
      params: {
        sort_order: opts.sort || 'desc',
        from: opts.from || dayjs().subtract(6, 'month').format('YYYY-MM-D'),
        till: opts.till || dayjs().format('YYYY-MM-D'),
        numtrades: opts.numtrades,
        start: 0,
        lang: opts.lang || 'ru',
        limit: 100,
        tradingsession: opts.session || 'total',
      },
    }
    return client.loopThroughMoexSource(request, 'history')
  }

  static async getSecuritiesHistoryInBoard(board, engine, market, session, opts = {}) {
    const request = {
      url: `/history/engines/${engine}/markets/${market}/sessions/${session}/boards/${board}/securities.json`,
      params: {
        date: opts.date,
        sort_order: opts.sort || 'desc',
        numtrades: opts.numtrades,
        start: 0,
        lang: opts.lang || 'ru',
        limit: 100,
        tradingsession: opts.session || 'total',
      },
    }

    const [columns, data] = await client.loopThroughMoexSource(request, 'history')

    return this.mapResponse(columns, data)
  }

  static async getListingForAllSharesInTQBR() {
    return this.getSecuritiesListingIn('TQBR', 'stock', 'shares')
  }

  static async getListingForTradingSharesInTQBR() {
    return this.getSecuritiesListingIn('TQBR', 'stock', 'shares', { status: 'traded' })
  }

  static async getSecuritiesListingIn(board, engine, market, opts = {}) {
    const request = {
      url: `/history/engines/${engine}/markets/${market}/boards/${board}/listing.json`,
      params: {
        start: 0,
        lang: opts.lang || 'ru', // can be ru or en
        status: opts.status || 'all', // can be all, traded, nottraded
        limit: 100,
      },
    }

    const [columns, data] = await client.loopThroughMoexSource(request, 'securities')

    return this.mapResponse(columns, data)
  }
}

module.exports = Moex
