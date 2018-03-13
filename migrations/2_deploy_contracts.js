'use strict'

const MyContract = artifacts.require('TimewalkLand')


module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(MyContract)
}

