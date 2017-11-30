const util = require('util')
const exec = util.promisify(require('child_process').exec)

const execOn = async (path, cmd, prefix) => {
  if (prefix) return await exec(`${prefix} cd ${path} && ${cmd}`)
  return await exec(`cd ${path} && ${cmd}`)
}

const ls = async (path) => {
  const { stdout } = await execOn(path, 'ls .')
  return stdout
}

const repositoryIsUpdated = async (path) => {
  await execOn(path, 'git fetch')
  const { stdout } = await execOn(path, 'git status -uno')
  const pattern = /Your branch is up to date with/
  return (stdout.match(pattern)) ? true : false
}

const pull = async (path) => {
  const { stdout } = await execOn(path, 'git pull')
  // TODO: Pull fail treatment (maybe stash?)
}

const installPackages = async (path, prefix) => {
  if (prefix) return await execOn(path, 'npm i', prefix)
  return await execOn(path, 'npm i')
}

const test = async (path, testCmd, testPredicate) => {
  // TODO: Implement test logic
}

module.exports = {
  repositoryIsUpdated,
  installPackages,
  execOn,
  pull,
  test,
  ls
}