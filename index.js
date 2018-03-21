'use strict'

const express     = require('express')
const fetch       = require('node-fetch')
const fs          = require('fs')
const helmet      = require('helmet')
const mustache    = require('mustache-express')
const querystring = require('querystring')


let abi

try {
  let contr = fs.readFileSync(__dirname + '/build/contracts/TimewalkLand.json')
  contr = JSON.parse(contr)
  abi = contr.abi
} catch(er) {
  console.error('failed to parse contract abi. ensure it is built and try again')
  process.exit(1)
}

const app = express()
const port = 8801
app.use(helmet())

app.engine('html', mustache())
app.set('view engine', 'html')
app.set('views', __dirname + '/views')

app.use('/', express.static('public'))

app.get('/', function(req, res) {
  res.render('index', { abi: JSON.stringify(abi), contractAddress: process.env.CONTRACT_ADDRESS, priceInWei: process.env.PRICE_IN_WEI })
})

// all routes below this line are API calls and should never cache.
app.use(function(req, res, next) {
  const val = 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
  res.set('Cache-Control', val)
  res.set('Pragma', 'no-cache')
  return next()
})

// convert a street address to a google plus code
app.get('/code', async function (req, res) {
  let result = querystring.stringify({ address: req.query.address, key: process.env.GOOGLE_GEOCODE_API_KEY })
  result = await fetch('https://plus.codes/api?' + result)
  result = await result.json()
  res.json(result)
})

// error handling: for now just console.log
app.use((err, request, response, next) => {
  console.log(err)
  response.status(500).send('Something broke! '+ JSON.stringify(err))
})

app.listen(port, (err) => {
  if (err)
    return console.log('something bad happened', err)

  console.log(`server is listening on ${port}`)
})
