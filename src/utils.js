const util = require('util')
const exec = util.promisify(require('child_process').exec)

const execOn = async (path, cmd, prefix) => {
  let retval = null
  try {
    if (prefix) return await exec(`${prefix} cd ${path} && ${cmd}`)
    retval = await exec(`cd ${path} && ${cmd}`)
  } catch(e) {
    console.log('Error: ' + e)
  }
  return retval
}

const ls = async (path) => {
  let retval = null
  try {
    const { stdout, stderr } = await execOn(path, 'ls .')
    retval = stdout
  } catch(e) {
    console.log('Error: ' + e)
    retval = stderr
  }
  return retval
}

const repositoryIsUpdated = async (path) => {
  let retval = null
  try {
    await execOn(path, 'git fetch')
    const { stdout } = await execOn(path, 'git status -uno')
    const pattern = /Your branch is up to date with/
    retval = (stdout.match(pattern)) ? true : false
  } catch(e) {
    console.log('Error: ' + e)
  }
  return retval
}

const pull = async (path) => {
  try {
    const { stdout } = await execOn(path, 'git pull')
  } catch(e) {
    console.log('Error: ' + e)
  }
}

const stash = async (path) => {
  try {
    const { stdout } = await execOn(path, 'git stash')
  } catch(e) {
    console.log('Error: ' + e)
  }
}

const installPackages = async (path, prefix) => {
  let retval = null
  try {
    retval = (prefix) ? await execOn(path, 'npm i', prefix) : await execOn(path, 'npm i')
  } catch(e) {
    console.log('Error: ' + e)
  }
  return retval
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
