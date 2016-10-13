import _ from 'lodash'
import co from 'co'
import faker from 'faker'
import sequential from 'promise-sequential'

const buildFile = function buildFile (parentFolderId, filesColleciton) {
  const doc = {
    name: faker.hacker.noun(),
    folder: parentFolderId,
    created: new Date().toString(),
    url: faker.image.imageUrl()
  }
  return filesColleciton.create(doc)
}

const buildFolder = function buildFolder (foldersCollection, paentFolderId) {
  const doc = {
    name: faker.hacker.noun(),
    parent: paentFolderId,
    created: new Date().toString()
  }
  return foldersCollection.create(doc)
}

const buildSequentially = (amount, buildFn) => {
  const builds = []
  _.times(amount, () => builds.push(buildFn))
  return sequential(builds)
}

const buildSubFoldersAndFiles = function buildSubFoldersAndFiles (amount, parentFolderId, filesColleciton, foldersCollection) {
  return co.call(this, function * () {
    const folder = yield buildFolder(foldersCollection, parentFolderId)
    const build = buildFile.bind(this, folder._id, filesColleciton)
    return buildSequentially(amount, build)
  })
}

const buildFoldersAndFiles = function buildFoldersAndFiles (amount, filesColleciton, foldersCollection) {
  return co.call(this, function * () {
    const folder = yield buildFolder(foldersCollection)
    const build = buildSubFoldersAndFiles.bind(this, amount, folder._id, filesColleciton, foldersCollection)
    return buildSequentially(amount, build)
  })
}

export default function loadData (amount, filesColleciton, foldersCollection) {
  const build = buildFoldersAndFiles.bind(this, amount, filesColleciton, foldersCollection)
  return buildSequentially(amount, build)
}
