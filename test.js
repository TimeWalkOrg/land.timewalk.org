'use strict'

const Web3     = require('web3')
const dotenv   = require('dotenv').config()
const contract = require('truffle-contract')
const fs       = require('fs')


const contractSource = fs.readFileSync(__dirname + '/build/contracts/TimewalkLand.json', { encoding: "utf8" })
const contract_data = JSON.parse(contractSource)
const TimewalkLand = contract(contract_data)


// TODO: figure out how to use geth for this
const provider = new Web3.providers.HttpProvider(`https://rinkeby.infura.io/${process.env.ETHEREUM_INFURA_ACCESS_TOKEN}`)

TimewalkLand.setProvider(provider)

// workaround for https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
if (typeof TimewalkLand.currentProvider.sendAsync !== "function") {
  TimewalkLand.currentProvider.sendAsync = function() {
    return TimewalkLand.currentProvider.send.apply(
      TimewalkLand.currentProvider, arguments
    );
  };
}


const contract_address = '0x8DC9EA69D166d623a8C032fB00993324F4490725'

const account_one = process.env.RINKEBY_ADDRESS

async function doit() {
  const instance = await TimewalkLand.at(contract_address)

  //const result = await instance.setPrices.call(10, 20, { from: account_one })
  //const result = await instance.setPrices.call(10, 20, { from: account_one })
  //console.log('result!:::', result)

  const placeId = 'ChIJOa8-jGSHhYARNW2GZ4vtVqY'  // 1617 kirkham st
  try {
    const result = await instance.claim(placeId)
   console.log('result::', result)
  } catch(er) {
    console.error('er:', er)
  }

}

doit()
