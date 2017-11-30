const ad = require('../index')
const { repositoryIsUpdated, ls, pull, installPackages } = ad.utils

ad.configServer({
  expressHostname: 'localhost',
  expressPostUrl: '/',
  expressPort: 8000,
  tcpPort: 9000
})

ad.listen()

ad.on('core', (done) => {
  console.log('Core reached')
  setTimeout(done, 5000)
})

ad.on('vue', (done) => {
  console.log('Vue reached')
  setTimeout(done, 5000)
})