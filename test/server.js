const ad = require('../index')
const { repositoryIsUpdated, ls, pull, installPackages } = ad.utils

ad.configServer({
  expressHostname: 'localhost',
  expressPostUrl: '/',
  expressPort: 8000,
  tcpPort: 9000
})

ad.listen()

ad.on('core', (payload, done) => {
  console.log('Core reached')
  console.log('Received --------')
  console.log(payload)
  console.log('-----------------')
  setTimeout(done, 10000)
})

ad.on('vue', (payload, done) => {
  console.log('Vue reached')
  setTimeout(done, 10000)
})
