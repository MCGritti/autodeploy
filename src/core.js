const messenger = require('messenger')
const express = require('express')
const https = require('https')
const bodyParser = require('body-parser')

const server = {
  tcpInstance: null,
  expressInstance: null,
  status: {
    busy: false,
  },
  config: {
    expressHostname: 'localhost',
    expressPostUrl: '/',
    expressPort: 8000,
    tcpPort: 9000,
    useHttps: false,
    secretToken: ''
  }
}

const logCfg = {
  enabled: false,
  prefix: '',
  suffix: ''
}

const log = (msg) => {
  if (logCfg) {
    let _msg = [logCfg.prefix, msg, logCfg.suffix]
    console.log(_msg.join(''))
  }
}

const events = [{
  name: 'ad_status',
  callback: (message, data) => {
    log('isBusy() === ' + isBusy())
    message.reply({
      busy: isBusy()
    })
  }
}]

const repoList = []
const busyQueue = []

const client = {
  tcpInstance: null,
  config: {
    tcpPort: 9000,
    busyRoute: (req, res, next) => {
      res.send('There are incomming updates. Please wait.')
    }
  }
}

const findRepoEntryById = (id) => {
  return repoList.reduce((obj, next) => {
    if (next.id === id) Object.assign(obj, next)
    return obj
  }, {})
}

const on = (id, callback) => {
  repoList.push({
    id,
    callback,
    payloads: []
  })
}

const off = () => {
  repoList.splice(0, this.repoList.length)
}

const findBusyQueueIndex = (id) => {
  return busyQueue.reduce((stack, next, index) => {
    if (next === id) stack.push(index)
    return stack
  }, [])
}

const removeFromBusyQueue = (id) => {
  let idx = findBusyQueueIndex(id)
  if (idx.length) {
    busyQueue.splice(idx[0], 1)
    idx.splice(0, 1)
    if (idx.length) doCallback(findRepoEntryById(id))
  }
}

const busyQueueContains = (id) => {
  return findBusyQueueIndex(id).length ? true : false
}

const isBusy = () => {
  return busyQueue.length ? true : false
}

const doCallback = (repoReg) => {
  repoReg.callback(repoReg.payloads[0], () => {
    removeFromBusyQueue(repoReg.id)
    repoReg.payloads.splice(0, 1)
  })
}

const configServer = (obj) => {
  Object.assign(server.config, obj)
}

const configClient = (obj) => {
  Object.assign(client.config, obj)
}

const getRepositoryName = (req) => {
  // TODO: Check other fields?
  let repoName = (req.body.project) ? req.body.project.name || null : null
  return repoName
}

const isTokenValid = (req) => {
  let secretToken = req.headers['x-gitlab-token'] || ''
  return (secretToken === server.config.secretToken)
}

const postCallback = (req, res) => {
  let repoName = getRepositoryName(req)
  let repoReg = findRepoEntryById(repoName)
  if (repoReg.callback && isTokenValid(req)) {
    let payload = req.body
    repoReg.payloads.push(payload)
    if (!busyQueueContains(repoName)) doCallback(repoReg)
    busyQueue.push(repoName)
  }
  res.send({
    busyQueue,
    repoList
  })
}

const createTcpServer = () => {
  if (server.tcpInstance) return false
  server.tcpInstance = messenger.createListener(server.config.tcpPort)
  events.map(event => {
    server.tcpInstance.on(event.name, event.callback)
  })
}

const createExpressServer = () => {
  let app = express()
  app.use(bodyParser.urlencoded({
    extended: true
  }))
  app.use(bodyParser.json())
  app.post(server.config.expressPostUrl, postCallback)

  if (server.config.useHttps) {
    createHttpsServer(app)
  } else {
    createHttpServer(app)
  }
}

const createHttpServer = (app) => {
  app.listen(server.config.expressPort, server.config.expressHostname, () => {
    console.log('Listening posts on http://' +
      server.config.expressHostname + ':' +
      server.config.expressPort +
      server.config.expressPostUrl)
  })
  server.expressInstance = app
}

const createHttpsServer = (app) => {
  // TODO: handle certificates
  // server.expressInstance = https.createServer()
}

const listen = () => {
  createTcpServer()
  createExpressServer()
}

const createClientRoute = () => {
  if (!client.tcpInstance) client.tcpInstance = messenger.createSpeaker(client.config.tcpPort)
  return (req, res, next) => {
    new Promise((resolve, reject) => {
        client.tcpInstance.request('ad_status', { dir: __dirname },
          data => {
            resolve(data)
          }, 500)
      })
      .then(data => {
        if (data.busy) {
          client.config.busyRoute(req, res, next)
        } else {
          next()
        }
      })
  }
}

module.exports = {
  createClientRoute,
  configClient,
  configServer,
  listen,
  off,
  on
}
