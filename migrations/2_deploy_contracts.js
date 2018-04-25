'use strict'

const MyContract = artifacts.require('TimewalkLand')
const Marketplace = artifacts.require('Marketplace')


module.exports = async (deployer) => {
  // deployment steps
  deployer.deploy(MyContract).then((contract) => {
    return deployer.deploy(Marketplace, MyContract.address)
  })
}
