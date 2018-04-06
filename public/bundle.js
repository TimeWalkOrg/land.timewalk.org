(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJicm93c2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIndXNlIHN0cmljdCdcblxuY29uc3Qgc2VhcmNoQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NlYXJjaCcpXG5jb25zdCByZWdpc3RlckJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZWdpc3RlcicpXG5cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHdlYjMgPSBuZXcgV2ViMyh3ZWIzLmN1cnJlbnRQcm92aWRlcilcbiAgY29uc3QgY29udHJhY3RJbnN0YW5jZSA9IHdlYjMuZXRoLmNvbnRyYWN0KGFiaSkuYXQoY29udHJhY3RBZGRyZXNzKVxuXG4gIGNvbnN0IHRva2VuSWRzID0gYXdhaXQgbGlzdFRva2Vuc0Zvck93bmVyKGNvbnRyYWN0SW5zdGFuY2UsIHdlYjMuZXRoLmFjY291bnRzWzBdKVxuXG4gIGlmKHRva2VuSWRzLmxlbmd0aClcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW5zRm9yT3duZXInKS5pbm5lckhUTUwgPSAnJ1xuXG4gIGNvbnN0IHVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9rZW5zRm9yT3duZXInKS5hcHBlbmRDaGlsZCh1bClcblxuICB0b2tlbklkcy5mb3JFYWNoKGFzeW5jICh0b2tlbklkKSA9PiB7XG4gICAgY29uc3QgbWV0YWRhdGEgPSBhd2FpdCBnZXRNZXRhRGF0YShjb250cmFjdEluc3RhbmNlLCB0b2tlbklkKVxuICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKVxuICAgIHVsLmFwcGVuZENoaWxkKGxpKVxuICAgIGNvbnN0IHBhcnRzID0gbWV0YWRhdGEuc3BsaXQoJyAnKVxuICAgIGxldCByZXN1bHQgPSBhd2FpdCBmZXRjaCgnL2NvZGU/YWRkcmVzcz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHBhcnRzWzBdKSlcbiAgICByZXN1bHQgPSBhd2FpdCByZXN1bHQuanNvbigpXG4gICAgbGkuaW5uZXJIVE1MID0gYCR7cmVzdWx0LnBsdXNfY29kZS5iZXN0X3N0cmVldF9hZGRyZXNzfSAgWyR7cGFydHNbMV19XWBcbiAgfSlcblxuICAvLyByZWdpc3RlciBhIHRva2VuXG4gIHJlZ2lzdGVyQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZXYpIHtcbiAgICBjb250cmFjdEluc3RhbmNlLmNsYWltKF9wbGFjZUlkICsgXCIgXCIgKyBfdGltZSwgeyBmcm9tOiBhZGRyLCB2YWx1ZTogcHJpY2VJbldlaSB9LCAoZXJyLCB0eEhhc2gpID0+IHtcbiAgICAgIGlmKCFlcnIpXG4gICAgICAgIGNvbnNvbGUubG9nKCd0cmFuc2FjdGlvbiBoYXNoOicsIHR4SGFzaClcbiAgICB9KVxuICB9KVxuXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBhc3luYyBmdW5jdGlvbihldikge1xuICAgIGV2LnByZXZlbnREZWZhdWx0KClcbiAgICBzZWFyY2hCdG4uc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsIHRydWUpXG5cbiAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwbGFjZScpXG4gICAgbGV0IHJlc3VsdCA9IGF3YWl0IGZldGNoKCcvY29kZT9hZGRyZXNzPScgKyBlbmNvZGVVUklDb21wb25lbnQoaW5wdXQudmFsdWUpKVxuICAgIHJlc3VsdCA9IGF3YWl0IHJlc3VsdC5qc29uKClcbiAgICBzZWFyY2hCdG4ucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpXG5cbiAgICBpZiAoIXJlc3VsdClcbiAgICAgIHJldHVyblxuXG4gICAgY29uc3QgeWVhcklucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3llYXInKVxuXG4gICAgLy8gUGFyYW1ldGVycyBmb3IgdGhlIGZ1bmN0aW9uIGluIHRoZSBzbWFydCBjb250cmFjdFxuICAgIGNvbnN0IF9wbGFjZUlkID0gcmVzdWx0LnBsdXNfY29kZS5nbG9iYWxfY29kZVxuICAgIGNvbnN0IF90aW1lID0geWVhcklucHV0LnZhbHVlXG5cbiAgICBjb25zdCBhZGRyID0gd2ViMy5ldGguYWNjb3VudHNbMF1cblxuICAgIC8vIGNoZWNrIGlmIHRoZSBwbGFjZSBpcyBhdmFpbGFibGVcbiAgICBjb25zdCBhdmFpbGFibGUgPSBhd2FpdCBpc1BsYWNlQXZhaWxhYmxlKGNvbnRyYWN0SW5zdGFuY2UsIF9wbGFjZUlkLCBfdGltZSlcblxuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc3VsdCcpXG5cbiAgICBpZiAoYXZhaWxhYmxlKSB7XG4gICAgICAvL3JlZ2lzdGVyQnRuLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKVxuICAgICAgcmVnaXN0ZXJCdG4uc3R5bGUuZGlzcGxheSA9ICcnXG4gICAgICBlbC5pbm5lckhUTUwgPSBgPHN0cm9uZz4ke3Jlc3VsdC5wbHVzX2NvZGUuYmVzdF9zdHJlZXRfYWRkcmVzc308L3N0cm9uZz4gaW4gPHN0cm9uZz4ke190aW1lfTwvc3Ryb25nPiBpcyBhdmFpbGFibGUuYFxuICAgIH0gZWxzZSB7XG4gICAgICBlbC5pbm5lckhUTUwgPSBgPHN0cm9uZz4ke3Jlc3VsdC5wbHVzX2NvZGUuYmVzdF9zdHJlZXRfYWRkcmVzc308L3N0cm9uZz4gaW4gPHN0cm9uZz4ke190aW1lfTwvc3Ryb25nPiBpcyBhbHJlYWR5IHRha2VuLmBcbiAgICB9XG5cbiAgfSlcbn0pXG5cblxuYXN5bmMgZnVuY3Rpb24gaXNQbGFjZUF2YWlsYWJsZShjb250cmFjdCwgX3BsYWNlSWQsIF90aW1lKSAge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgY29udHJhY3QucGxhY2VBdmFpbGFibGUoX3BsYWNlSWQgKyBcIiBcIiArIF90aW1lLCBmdW5jdGlvbihlcnIsIGF2YWlsYWJsZSkge1xuICAgICAgaWYoZXJyKVxuICAgICAgICByZXR1cm4gcmVqZWN0KGVycilcbiAgICAgIHJlc29sdmUoYXZhaWxhYmxlKVxuICAgIH0pXG4gIH0pXG59XG5cblxuYXN5bmMgZnVuY3Rpb24gbGlzdFRva2Vuc0Zvck93bmVyKGNvbnRyYWN0LCBhY2NvdW50QWRkcmVzcykge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnRyYWN0LnRva2Vuc09mKGFjY291bnRBZGRyZXNzLCAoZXJyLCB0b2tlbklkcykgPT4ge1xuICAgICAgaWYoZXJyKVxuICAgICAgICByZXR1cm4gcmVqZWN0KGVycilcblxuICAgICAgLy8gdGhpcyBhcmUgcmVhbGx5IGxhcmdlIG51bWJlcnMgd2UgbmVlZCB0byBwYXJzZSB0aGVtIGFzIHN0cmluZyBzbyB3ZSBjYW4gdXNlIHRoZW1cbiAgICAgIHRva2VuSWRzID0gdG9rZW5JZHMubWFwKHQgPT4gdC50b1N0cmluZygxMCkpXG4gICAgICByZXNvbHZlKHRva2VuSWRzKVxuICAgIH0pXG4gIH0pXG59XG5cblxuYXN5bmMgZnVuY3Rpb24gZ2V0TWV0YURhdGEoY29udHJhY3QsIHRva2VuSWQpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlICwgcmVqZWNldCkgPT4ge1xuICAgIGNvbnRyYWN0LnRva2VuTWV0YWRhdGEodG9rZW5JZCwgKGVyciwgbWV0YWRhdGEpID0+IHtcbiAgICAgIGlmKGVycilcbiAgICAgICAgcmVqZWN0KGVycilcblxuICAgICAgcmVzb2x2ZShtZXRhZGF0YSlcbiAgICB9KVxuICB9KVxufVxuIl19
