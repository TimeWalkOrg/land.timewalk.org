'use strict'

const searchBtn = document.querySelector('#search')
const registerBtn = document.querySelector('#register')


window.addEventListener('load', async () => {
  const web3 = new Web3(web3.currentProvider)
  const contractInstance = web3.eth.contract(abi).at(contractAddress)

  const tokenIds = await listTokensForOwner(contractInstance, web3.eth.accounts[0])

  if(tokenIds.length)
    document.getElementById('tokensForOwner').innerHTML = ''

  const ul = document.createElement('ul')
  document.getElementById('tokensForOwner').appendChild(ul)

  tokenIds.forEach(async (tokenId) => {
    const metadata = await getMetaData(contractInstance, tokenId)
    const li = document.createElement('li')
    ul.appendChild(li)
    const parts = metadata.split(' ')
    let result = await fetch('/code?address=' + encodeURIComponent(parts[0]))
    result = await result.json()
    li.innerHTML = `${result.plus_code.best_street_address}  [${parts[1]}]`
  })

  // register a token
  registerBtn.addEventListener('click', function(ev) {
    contractInstance.claim(_placeId + " " + _time, { from: addr, value: priceInWei }, (err, txHash) => {
      if(!err)
        console.log('transaction hash:', txHash)
    })
  })

  document.querySelector('form').addEventListener('submit', async function(ev) {
    ev.preventDefault()
    searchBtn.setAttribute('disabled', true)

    const input = document.querySelector('#place')
    let result = await fetch('/code?address=' + encodeURIComponent(input.value))
    result = await result.json()
    searchBtn.removeAttribute('disabled')

    if (!result)
      return

    const yearInput = document.querySelector('#year')

    // Parameters for the function in the smart contract
    const _placeId = result.plus_code.global_code
    const _time = yearInput.value

    const addr = web3.eth.accounts[0]

    // check if the place is available
    const available = await isPlaceAvailable(contractInstance, _placeId, _time)

    const el = document.getElementById('result')

    if (available) {
      //registerBtn.removeAttribute('disabled')
      registerBtn.style.display = ''
      el.innerHTML = `<strong>${result.plus_code.best_street_address}</strong> in <strong>${_time}</strong> is available.`
    } else {
      el.innerHTML = `<strong>${result.plus_code.best_street_address}</strong> in <strong>${_time}</strong> is already taken.`
    }

  })
})


async function isPlaceAvailable(contract, _placeId, _time)  {
  return new Promise(function(resolve, reject) {
    contract.placeAvailable(_placeId + " " + _time, function(err, available) {
      if(err)
        return reject(err)
      resolve(available)
    })
  })
}


async function listTokensForOwner(contract, accountAddress) {
  return new Promise((resolve, reject) => {
    contract.tokensOf(accountAddress, (err, tokenIds) => {
      if(err)
        return reject(err)

      // this are really large numbers we need to parse them as string so we can use them
      tokenIds = tokenIds.map(t => t.toString(10))
      resolve(tokenIds)
    })
  })
}


async function getMetaData(contract, tokenId) {
  return new Promise((resolve , rejecet) => {
    contract.tokenMetadata(tokenId, (err, metadata) => {
      if(err)
        reject(err)

      resolve(metadata)
    })
  })
}
