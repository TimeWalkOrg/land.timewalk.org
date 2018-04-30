'use strict'

const MyContract  = artifacts.require('TimewalkLand')
const Marketplace = artifacts.require('Marketplace')


module.exports = async (deployer) => {
  let token, marketplace

  deployer.then(() => {
    return MyContract.new()
  }).then((instance) => {
    token = instance
    return Marketplace.new(token.address)
  }).then((instance) => {
    marketplace = instance

    console.log(`Token: ${token.address} Marketplace: ${marketplace.address}`)

    return token.setMarketplaceContract(marketplace.address)
  })
}
