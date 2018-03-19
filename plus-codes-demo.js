'use strict'

const express     = require('express')
const fetch       = require('node-fetch')
const helmet      = require('helmet')
const querystring = require('querystring')


const GOOGLE_GEOCODE_API_KEY = 'AIzaSyCbgvyEGw9Ueg0NnBOw8uTfP5Vg4sTL-q0'

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title class = "titleText">google plus codes usage example</title>
  <style>
    * {
      font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;
      text-rendering: optimizeLegibility;
    }
  </style>
</head>
<body>
  <div style="display: grid; grid-template-columns: 1fr 90px; grid-template-rows: 40px 1fr; grid-gap: 10px">
    <input type="text" placeholder="e.g., 428 Howe st Oakland, CA"/>
    <button>Search</button>
    <pre> </pre>
  </div>

  <script>
    'use strict'

    const button = document.querySelector('button')
    button.addEventListener('click', async function(ev) {
      ev.preventDefault()
      button.setAttribute('disabled', true)

      const input = document.querySelector('input')
      let result = await fetch('/code?address=' + encodeURIComponent(input.value))
      result = await result.json()
      document.querySelector('pre').innerText = JSON.stringify(result, null, 2)
      button.removeAttribute('disabled')
    })
  </script>
</body>
</html>`

const app = express()
const port = 8801
app.use(helmet())

app.get('/', (req, res) => {
  res.send(html)
})

// convert a street address to a google plus code
app.get('/code', async function (req, res) {
  let result = querystring.stringify({ address: req.query.address, key: GOOGLE_GEOCODE_API_KEY })
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
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
})
