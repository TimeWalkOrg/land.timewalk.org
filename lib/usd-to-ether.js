'use strict'

global.fetch = require('node-fetch')
const cc     = require('cryptocompare')
const unit   = require('ethjs-unit')


//const priceInFinney = unit.fromWei(process.env.PRICE_IN_WEI, 'finney')

module.exports = async function usdToEther(usd) {
  const prices = await cc.price('USD', [ 'ETH' ])
  return prices.ETH * usd
}
