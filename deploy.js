'use strict'

const dotenv = require('dotenv').config()
const Web3   = require('web3')
const fs     = require('fs')
const solc   = require('solc')
const tx     = require('ethereumjs-tx')


const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/"))
deployContract()

//showABI()


function deployContract() {
  web3.eth.getTransactionCount(process.env.RINKEBY_ADDRESS).then((txnCount) => {
    console.log("txn count", txnCount)
    const source = fs.readFileSync(__dirname+'/contracts/TimewalkLand.sol')
    const compiled = solc.compile(source.toString(), 1)
    const bytecode = compiled.contracts[':TimewalkLand'].bytecode
    const rawContractTx = {
      from: process.env.RINKEBY_ADDRESS,
      nonce: web3.utils.toHex(txnCount),
      gasLimit: web3.utils.toHex(4000000),
      gasPrice: web3.utils.toHex(20000000000),
      data: '0x' + bytecode,
    }
    console.log("contract deploying...")
    sendRaw(rawContractTx)
  })
}


function showABI() {
  const source = fs.readFileSync(__dirname+'/contracts/TimewalkLand.sol')
  const compiled = solc.compile(source.toString(), 1)
  const abi = compiled.contracts[':TimewalkLand'].interface
  console.log("abi", abi)
}


function sendRaw(rawTx) {
  const privateKey = new Buffer(process.env.RINKEBY_KEY, 'hex')
  const transaction = new tx(rawTx)
  transaction.sign(privateKey)
  const serializedTx = transaction.serialize().toString('hex')
  web3.eth.sendSignedTransaction(
  '0x' + serializedTx, function(err, result) {
    if(err)
      console.log("txn err", err)
    else
      console.log("txn result", result)
  })
}
