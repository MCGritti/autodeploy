const express = require('express')
const app = express()

const http = require('http')
const https = require('https')

const path = require('path')
const bodyParser = require('body-parser')

const ad = require('../index')

ad.configClient({
  tcpPort: 9000
})

const adclient = ad.createClientRoute()

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(adclient)
app.use((req, res, next) => {
  console.log('Im here')
  next()
  // next()
})
app.get('/', (req, res) => {
  res.send('Hello, world.')
})

app.listen(1111, 'localhost', () => {
  console.log('Listening on port 1111 on pid ' + process.pid)
})

process.on('SIGINT', () => {
  console.log('Kill by ctrl')
  process.exit(0)
})
