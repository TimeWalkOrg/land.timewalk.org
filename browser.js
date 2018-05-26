'use strict'

const bigInt          = require('big-integer')
const isTouch         = require('is-touch')
const Web3            = require('web3')
const truffleContract = require('truffle-contract')


window.addEventListener('load', async () => {
  let app
  const web3js = createWeb3Instance()

  pollForAccountChanges(web3js, async function(err, result) {
    if(!result)
      return

    window.isInfuraNode = web3js.currentProvider.host === INFURA_NODE

    if(!result.account) {
      if (isInfuraNode) {
        app = await setupApp(web3js)

        document.getElementById('guest').style.display = ''
        if(isTouch)
          document.getElementById('trust-browser').style.display = ''
        else
          document.getElementById('metamask-browser').style.display = ''
        document.getElementById('main').style.display = 'none'
        document.getElementById('error').style.display = 'none'
      } else {
        displayErrorPage('Please login to metamask or your ethereum client to access this app.')
      }
    } else if(result.network !== contractNetwork) {
      displayErrorPage('This contract runs on the ethereum network:' + contractNetwork + '. Please switch to that.')
    } else {
      if(!app)
        app = await setupApp(web3js)

      document.getElementById('main').style.display = ''
      document.getElementById('guest').style.display = 'none'
      document.getElementById('error').style.display = 'none'
    }
  })
})


// create a UI component that displays owned tokens and for sale tokens of a given user
async function ownedTokensComponent(web3js, contract, marketplace, tokenIds, tokensForSale) {
  const addr = web3js.eth.accounts[0]

  const yourTokens = tokensForSale.filter((token) => { token.seller === addr })

  if(tokenIds.length || yourTokens.length)
    document.getElementById('tokensForOwner').innerHTML = ''

  const ul = document.createElement('ul')

  for(let tokenId of tokenIds) {
    const li = await ownedTokenComponent(web3js, contract, tokenId)
    ul.appendChild(li)
  }

  for(let token of yourTokens) {
    const li = await tokenForSaleComponent(web3js, contract, marketplace, token)
    ul.appendChild(li)
  }

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
  const metadata = await contract.tokenMetadata(tokenId)
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
    btn.dataset.tokenId = tokenId
    btn.classList.add('buysell')
    btn.style.marginLeft = '16px'

    li.appendChild(btn)

    btn.addEventListener('click', async (ev) => {
      console.log('nice!', btn.dataset.tokenId, input.value, 'adrre:', addr)
      const tokenId = btn.dataset.tokenId
      //const tokenId = getTokenId(web3js, metadata)

      console.log('compared to', getTokenId(web3js, metadata))
      console.log('sell token:')

      const tx = await contract.approveAndSell(tokenId, web3js.toWei(input.value, 'ether'), { from: addr })

      console.log('Token set on sale, tx hash: ', tx)
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
  const addr = isInfuraNode ? '0x0' : web3js.eth.accounts[0]

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
  const addr = isInfuraNode ? '0x0' : web3js.eth.accounts[0]

  const li = document.createElement('li')
  li.style.padding = '0px 0px 10px 0px'

  const span = document.createElement('p')
  span.style.paddingRight = '10px'
  span.style.marginBottom = '4px'
  li.appendChild(span)

  const metadata = await contract.placeIdLookup(token.id)
  const parts = metadata.split(' ')
  let result = await fetch('/code?address=' + encodeURIComponent(parts[0]))
  result = await result.json()

  span.innerText = `${result.plus_code.best_street_address}  [${parts[1]}]`

  // You can cancel sale of only tokens you own
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

    cancelBtn.addEventListener('click', async () => {
      const tx = await marketplace.cancel(token.id, {from: addr})

      console.log(tx)
    })
  } else if(!isInfuraNode) {
    // you can only buy tokens you don't own
    const btn = document.createElement('button')
    btn.classList.add('buysell')
    btn.innerHTML = 'Buy for ' + web3js.fromWei(token.price, 'ether') + ' ETH'

    btn.addEventListener('click', async () => {
      const tx = await marketplace.buy(token.id, {from: addr, value: token.price})
      console.log(tx)
    })

    li.appendChild(btn)
  }

  return li
}


async function ownerWalletComponent(web3js, contract, userAddr) {
  const ownerAddress = await contract.owner()

  const contractBalance = await balanceOf(web3js, userAddr)

  const ownerAddressElement = document.querySelector('#owner_address')
  ownerAddressElement.innerHTML = `The address of the owner: ${ownerAddress}`

  const contractBalanceElement = document.querySelector('#contract_balance')
  contractBalanceElement.innerHTML = `Balance of the contract: ${web3js.fromWei(contractBalance, 'ether')} eth`

  const ethAddressInput = document.querySelector('#eth_address_input')
  const ethValueInput = document.querySelector('#amount_ether_input')
  const transferBtn = document.querySelector('#transfer_eth_btn')
  const withdrawBtn = document.querySelector('#withdraw_btn')

  withdrawBtn.addEventListener('click', async (ev) => {
    console.log(userAddr)
    await contract.withdraw({from: userAddr})
  })

  transferBtn.addEventListener('click', async (ev) => {
    await sendEther(web3js, userAddr, ethAddressInput.value, web3js.toWei(ethValueInput.value, 'ether'))
  })
}


// create a UI component for searching and buying tokens
function buyTokenComponent(web3js, contract, marketplace) {
  let placeId, time

  const addr = web3js.eth.accounts[0]
  const searchBtn = document.querySelector('#search')
  const registerBtn = document.querySelector('#register')
  registerBtn.innerHTML = 'Buy for ' + web3js.fromWei(priceInWei, 'ether') + ' ETH'

  // register a token
  registerBtn.addEventListener('click', async (ev) => {
    if (!placeId || !time)
      return

    console.log('Starting the claim transaction....', placeId + ' ' + time)

    const tx = await contract.claim(placeId + ' ' + time, { from: addr, value: priceInWei })

    console.log('Claim transaction mined, tx data: ')
    console.log(tx)
  })

  searchBtn.addEventListener('click', async (ev) => {
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
    const isAvailable = await contract.placeAvailable(placeId + " " + time)

    const el = document.getElementById('result')

    registerBtn.style.display = isAvailable ? '' : 'none'

    if (isAvailable) {
      el.innerHTML = `<strong>${result.plus_code.best_street_address}</strong> in <strong>${time}</strong> is available.`
    } else {
      let tokenId = getTokenId(web3js, placeId + " " + time)
      let token = await getTokenSaleInfo(marketplace, tokenId)

      if (token.seller === '0x0000000000000000000000000000000000000000') {
        let myTokenIds = await listTokensForOwner(contract, addr)
        if (myTokenIds.indexOf(tokenId) >= 0)
          el.innerHTML = `You already own the <strong>${result.plus_code.best_street_address}</strong> in <strong>${time}</strong> token.`
        else
          el.innerHTML = `<strong>${result.plus_code.best_street_address}</strong> in <strong>${time}</strong> is already owned, and not for sale right now.`
      } else if(token.seller === addr) {
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


// ui for the owner of the contract to adjust price
async function setTokenPriceComponent(web3js, contract) {
  const addr = web3js.eth.accounts[0]
  const tokenPriceEl = document.getElementById('set-token-price')

  const owner = await contract.owner()

  tokenPriceEl.style.display = (owner === addr) ? '' : 'none'

  const input = tokenPriceEl.querySelector('input')
  input.value = web3js.fromWei(priceInWei, 'ether')

  const btn = tokenPriceEl.querySelector('button')

  btn.addEventListener('click', async (ev) => {
    await contract.setPrice(web3js.toWei(input.value, 'ether'), {from: owner})
  })
}


async function setupApp(web3js) {
  const tokenContract = truffleContract(abi)
  const marketplaceContract = truffleContract(marketplaceAbi)

  tokenContract.setProvider(web3js.currentProvider)
  marketplaceContract.setProvider(web3js.currentProvider)

  const contract = tokenContract.at(contractAddress)
  const marketplace = marketplaceContract.at(marketplaceAddress)

  const addr = web3js.eth.accounts[0]

  if (!isInfuraNode) {
    let tokenIds = await listTokensForOwner(contract, addr)

    await ownerWalletComponent(web3js, contract, addr)

    const tokensForSale = await getTokensForSale(marketplace)
    const usersTokensOnSale = tokensForSale.filter(t => t.seller === addr)

    setTokenPriceComponent(web3js, contract)

    // if  (usersTokensOnSale.length > 0)
    //  tokenIds = [...tokenIds, ...usersTokensOnSale]

    const ul = await ownedTokensComponent(web3js, contract, marketplace, tokenIds, tokensForSale)
    document.getElementById('tokensForOwner').appendChild(ul)

    const ulSale = tokensForSaleComponent(web3js, contract, marketplace, tokensForSale)
    document.getElementById('tokensForSale').appendChild(ulSale)

    await buyTokenComponent(web3js, contract, marketplace)
  } else {
    const tokensForSale = await getTokensForSale(marketplace)

    if(tokensForSale.length)
      document.getElementById('tokensForSale2').innerText = ''

    const ulSale = tokensForSaleComponent(web3js, contract, marketplace, tokensForSale)
    document.getElementById('tokensForSale2').appendChild(ulSale)
  }

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
    return new Web3(web3.currentProvider)  // Use Mist/MetaMask's provider

  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  return new Web3(new Web3.providers.HttpProvider(INFURA_NODE))
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


async function listTokensForOwner(contract, accountAddress) {
  let tokenIds = await contract.tokensOf(accountAddress)
  tokenIds = tokenIds.map(t => t.toString(10))
  return tokenIds
}


async function getTokensForSale(market) {
  const tokenSaleIds = await market.getAlltokensOnSale()
  const tokenPromises = tokenSaleIds.map(t => getTokenSaleInfo(market, t))

  return Promise.all(tokenPromises)
}


function sendEther(web3js, from, to, value) {
  return new Promise((resolve , rejecet) => {
    web3js.eth.sendTransaction({from, to, value}, (err, tx) => {
      if(err)
        reject(err)
      else
        resolve(tx)
    })
  })
}


function balanceOf(web3js, address) {
  return new Promise((resolve , rejecet) => {
    web3js.eth.getBalance(address, (err, address) => {
      if(err)
        reject(err)
      else
        resolve(address)
    })
  })
}


async function getTokenSaleInfo(market, tokenId) {
  const res = await market.sellOrders(tokenId)

  return {
    id: tokenId,
    price: res[0].valueOf(),
    seller: res[1],
    timestamp: res[2].valueOf()
  }
}


function getTokenId(web3js, placeData) {
  const hashed = web3js.sha3(placeData)
  return (new bigInt(hashed.slice(2), 16)).toString(10)
}
