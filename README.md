# gitlab-autodeploy
Handle gitlab post requests easier.

## Autodeploy server example
Create an index.js in your 'adserver' with
```js
const ad = require('gitlab-autodeploy')
const { repositoryIsUpdated, execOn } = ad.utils

ad.configServer({
  expressHostname: 'my.domain.com', // Domain to be used in gitlab hook config
  expressPostUrl: '/',              // Route used to listen post's from gitlab
  expressPort: 8000,                // Express port
  tcpPort: 9000,                    // Tcp port (to comunicate with other local servers)
  secretToken: 'someSecretToken'    // Received as x-gitlab-token header
})

ad.listen()

const repoNamePath = '/var/node/repoName'

// Handling a post from gitlab for repo 'repoName' 
ad.on('repoName', (payload, done) => {
  (async () => {
    if (await repositoryIsUpdated(repoNamePath)) {
      console.log('Repository already up to date')
    } else {
      console.log('Applying some changes')
      if (foo(payload)) {
        // Check something in payload
      }
      await execOn(repoNamePath, 'git fetch && get merge')
      done() // This must be called at the end
    }
  })()
})
```

## Configuring your express application
Register gitlab-autodeploy in your application with
```js
const express = require('express')
const app = express()

//
// Import and configure your modules
//

// Import and configure gitlab-autodeploy
const ad = require('gitlab-autodeploy')
ad.configClient({
  tcpPort: 9000,
  busyRoute: (req, res, next) => {
    // Make something when autodeploy is busy
  }
})
const adclient = ad.createClientRoute()

// And finally, use it in your application
// to comunicate with the autodeploy server.
app.use(adclient)
```
Further information will be added in the next weeks.
