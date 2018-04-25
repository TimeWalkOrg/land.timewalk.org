'use strict'

const bigInt = require('big-integer')
const Web3   = require('web3')


window.addEventListener('load', async () => {
  let app
  const web3js = createWeb3Instance()

  pollForAccountChanges(web3js, async function(err, result) {
    if(!result)
      return

    if(!result.account) {
      displayErrorPage('Please login to metamask or your ethereum client to access this app.')
    } else if(result.network !== contractNetwork) {
      displayErrorPage('This contract runs on the ethereum network:' + contractNetwork + '. Please switch to that.')
    } else {
      if(!app)
        app = await setupApp(web3js)

      document.getElementById('main').style.display = ''
      document.getElementById('error').style.display = 'none'
    }
  })
})


// create a UI component that displays owned tokens and for sale tokens of a given user
async function ownedTokensComponent(web3js, contract, marketplace, tokenIds, tokensForSale) {
  const addr = web3js.eth.accounts[0]

  if(tokenIds.length || tokensForSale.length)
    document.getElementById('tokensForOwner').innerHTML = ''

  const ul = document.createElement('ul')

  tokenIds.forEach(async (tokenId, i) => {
    const li = await ownedTokenComponent(web3js, contract, tokenId)
    ul.appendChild(li)
  })

  tokensForSale.forEach(async token => {
    if(token.seller !== addr)
      return

    const li = await tokenForSaleComponent(web3js, contract, marketplace, token)
    ul.appendChild(li)
  })

  return ul
}


// create a UI component that displays an owned token of a given user
async function ownedTokenComponent(web3js, contract, tokenId) {
  const addr = web3js.eth.accounts[0]

  const li = document.createElement('li')
  li.style.padding = '0px 0px 10px 0px'

  if (tokenId.seller)
    tokenId = tokenId.id

  const span = document.createElement('p')
  const metadata = await getMetaData(contract, tokenId)
  const parts = metadata.split(' ')
  let result = await fetch('/code?address=' + encodeURIComponent(parts[0]))
  result = await result.json()
  span.innerHTML = `${result.plus_code.best_street_address}  [${parts[1]}]`
  span.style.marginBottom = '4px'

  const input = document.createElement('input')
  input.style.width = '50px'
  input.type = 'text'
  input.value = 0.0001

  const labl = document.createElement('span')
  labl.style.marginLeft = '6px'
  labl.innerText = 'ETH'

  li.appendChild(span)
  li.appendChild(input)
  li.appendChild(labl)

  if (typeof tokenId === 'string') {
    const btn = document.createElement('button')
    btn.innerHTML = 'Put on Sale'
    btn.classList.add('buysell')
    btn.style.marginLeft = '16px'

    li.appendChild(btn)

    btn.addEventListener('click', () => {
      const tokenId = getTokenId(web3js, metadata)
      console.log(tokenId, input.value)
      contract.approveAndSell(tokenId, web3js.toWei(input.value, 'ether'), {from: addr}, (err, res) => {
        console.log(res)
      })
    })
  } else {
    const labl = document.createElement('span')
    labl.style.marginLeft = '6px'
    labl.innerText = 'Already on Sale'
    li.appendChild(labl)
  }

  return li
}


// create a UI component that shows all tokens for sale by owner
function tokensForSaleComponent(web3js, contract, marketplace, tokensForSale) {
  const addr = web3js.eth.accounts[0]

  if(tokensForSale.length)
    document.getElementById('tokensForSale').innerHTML = ''

  const ulSale = document.createElement('ul')

  tokensForSale.forEach(async token => {
    // exclude tokens you own from the for sale list
    if(token.seller === addr)
      return

    const li = await tokenForSaleComponent(web3js, contract, marketplace, token)
    ulSale.appendChild(li)
  })

  return ulSale
}


// create a UI component for selling one token
async function tokenForSaleComponent(web3js, contract, marketplace, token) {
  const addr = web3js.eth.accounts[0]
  const li = document.createElement('li')
  li.style.padding = '0px 0px 10px 0px'

  const span = document.createElement('p')
  span.style.paddingRight = '10px'
  span.style.marginBottom = '4px'
  li.appendChild(span)

  const metadata = await getPlaceData(contract, token.id)
  const parts = metadata.split(' ')
  let result = await fetch('/code?address=' + encodeURIComponent(parts[0]))
  result = await result.json()

  span.innerText = `${result.plus_code.best_street_address}  [${parts[1]}]`

  // You can cancel only tokens you own
  if (token.seller === addr) {
    const input = document.createElement('input')
    input.disabled = true
    input.style.width = '50px'
    input.type = 'text'
    input.value = web3js.fromWei(token.price, 'ether')
    li.appendChild(input)

    const labl = document.createElement('span')
    labl.style.marginLeft = '6px'
    labl.innerText = 'ETH'
    li.appendChild(labl)



    const cancelBtn = document.createElement('button')
    cancelBtn.innerHTML = 'Cancel Sale'
    cancelBtn.classList.add('buysell')
    cancelBtn.style.marginLeft = '16px'
    li.appendChild(cancelBtn)

    cancelBtn.addEventListener('click', () => {
      marketplace.cancel(token.id, {from: addr}, (err, res) => {
        console.log(res)
      })
    })
  } else {
    // you can only buy tokens you don't own
    const btn = document.createElement('button')
    btn.classList.add('buysell')
    btn.innerHTML = 'Buy for ' + web3js.fromWei(token.price, 'ether') + ' ETH'

    btn.addEventListener('click', () => {
      marketplace.buy(token.id, {from: addr, value: token.price}, (err, res) => {
        console.log(res)
      })
    })

    li.appendChild(btn)
  }

  return li
}


// create a UI component for searching and buying tokens
function buyTokenComponent(web3js, contract, marketplace) {
  let placeId, time

  const addr = web3js.eth.accounts[0]
  const searchBtn = document.querySelector('#search')
  const registerBtn = document.querySelector('#register')
  registerBtn.innerHTML = 'Buy for ' + web3js.fromWei(priceInWei, 'ether') + ' ETH'

  // register a token
  registerBtn.addEventListener('click', function(ev) {
    if (!placeId || !time)
      return

    contract.claim(placeId + ' ' + time, { from: addr, value: priceInWei }, (err, res) => {
      if(!err)
        console.log('claim result', res)
    })
  })

  searchBtn.addEventListener('click', async function(ev) {
    ev.preventDefault()
    searchBtn.setAttribute('disabled', true)

    const input = document.querySelector('#place')
    let result = await fetch('/code?address=' + encodeURIComponent(input.value))
    result = await result.json()
    searchBtn.removeAttribute('disabled')

    if (!result)
      return

    // Parameters for the function in the smart contract
    placeId = result.plus_code.global_code
    time = document.querySelector('#year').value

    // check if the place is available
    const isAvailable = await isPlaceAvailable(contract, placeId, time)

    const el = document.getElementById('result')

    registerBtn.style.display = isAvailable ? '' : 'none'

    if (isAvailable) {
      el.innerHTML = `<strong>${result.plus_code.best_street_address}</strong> in <strong>${time}</strong> is available.`
    } else {
      let tokenId = getTokenId(web3js, placeId + " " + time)
      let token = await getTokenSaleInfo(marketplace, tokenId)

      if(token.seller === addr) {
        el.innerHTML = `You already own the <strong>${result.plus_code.best_street_address}</strong> in <strong>${time}</strong> token.`
      } else {
        const forSale = await tokenForSaleComponent(web3js, contract, marketplace, token)
        forSale.style.listStyle = 'none'
        el.innerHTML = ''
        el.appendChild(forSale)
      }
    }
  })
}


async function setupApp(web3js) {
  const contract = web3js.eth.contract(abi).at(contractAddress)
  const marketplace = web3js.eth.contract(marketplaceAbi).at(marketplaceAddress)
  const addr = web3js.eth.accounts[0]

  let tokenIds = await listTokensForOwner(contract, addr)

  const tokensForSale = await getTokensForSale(marketplace)
  const usersTokensOnSale = tokensForSale.filter(t => t.seller === addr)

  //if  (usersTokensOnSale.length > 0)
  //  tokenIds = [...tokenIds, ...usersTokensOnSale]

  const ul = await ownedTokensComponent(web3js, contract, marketplace, tokenIds, tokensForSale)
  document.getElementById('tokensForOwner').appendChild(ul)

  const ulSale = tokensForSaleComponent(web3js, contract, marketplace, tokensForSale)
  document.getElementById('tokensForSale').appendChild(ulSale)

  buyTokenComponent(web3js, contract, marketplace)

  return true
}


function displayErrorPage(message) {
  const main = document.getElementById('main')
  const error = document.getElementById('error')
  error.innerText = message
  error.style.display = ''
  main.style.display = 'none'
}


function createWeb3Instance() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined')
    // Use Mist/MetaMask's provider
    return new Web3(web3.currentProvider)

  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  return new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
}


function pollForAccountChanges(web3js, callback) {
  let account, network

  const accountInterval = setInterval(async function() {
    const n = await getEthereumNetwork(web3js)
    if(n !== network || web3js.eth.accounts[0] !== account) {
      account = web3js.eth.accounts[0]
      network = n
      callback(undefined, { account, network})
    }
  }, 500) // poll twice per second
}


// @return int network id (1 === mainnet, 2 === morden, 3 === ropsten, 4 === rinkeby, 42 === kovan)
async function getEthereumNetwork(web3js) {
  return new Promise(function(resolve, reject) {
    web3js.version.getNetwork((err, netId) => {
      if(err)
        return reject(err)

      resolve(netId)
    })
  })
}


async function isPlaceAvailable(contract, placeId, time)  {
  return new Promise(function(resolve, reject) {
    contract.placeAvailable(placeId + " " + time, function(err, available) {
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
      else
        resolve(metadata)
    })
  })
}


async function getTokensForSale(market) {
  const tokenSaleIds = await new Promise((resolve, reject) => {
    market.getAlltokensOnSale((err, res) => {
      if(err)
        reject(err)
      else
        resolve(res)
    })
  })

  const tokenPromises = tokenSaleIds.map(t => getTokenSaleInfo(market, t))

  return Promise.all(tokenPromises)
}


function getTokenSaleInfo(market, tokenId) {
  return new Promise((resolve, reject) => {
    market.sellOrders(tokenId, (err, res) => {
      if(err)
        return reject(err)

      resolve({
        id: tokenId,
        price: res[0].valueOf(),
        seller: res[1],
        timestamp: res[2].valueOf()
      })
    })
  })
}


function getPlaceData(contract, tokenId) {
  return new Promise((resolve, reject) => {
    contract.placeIdLookup(tokenId, (err, res) => {
      if(err)
        reject(err)
      else
        resolve(res)
    })
  })
}


function getTokenId(web3js, placeData) {
  const hashed = web3js.sha3(placeData)
  return (new bigInt(hashed.slice(2), 16)).toString(10)
}
