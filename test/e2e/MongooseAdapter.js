import mongooseMob from 'mongoose-mob'
import _ from 'lodash'
import co from 'co'
import { MongooseAdapter } from '../../src/MongooseAdapter'
import loadData from '../util/loadFakeData'

const mongoUri = 'mongodb://localhost/jeggy-mongoose-test'
const mongooseConnection = mongooseMob.getConnection(mongoUri)

describe('MongooseAdapter e2e', function () {
  let mongooseAdapter

  beforeEach(() => {
    mongooseAdapter = new MongooseAdapter(mongooseConnection)
  })

  it('should be able to instantiate a schema', function () {
    mongooseAdapter.addCollection('Test', new mongooseMob.Schema({
      arr: [{type: String}]
    }))

    var collection = mongooseAdapter.getCollection('Test')
    return expect(collection.create({arr: ['test']})).to.eventually.be.an('object')
  })

  it('should populate documents', function () {
    this.timeout(5000)
    const filesColleciton = mongooseAdapter.addCollection('File', new mongooseMob.Schema({
      name: String,
      folder: { type: mongooseMob.Schema.Types.ObjectId, ref: 'Folder', required: true },
      created: Date,
      url: String
    }))
    const foldersCollection = mongooseAdapter.addCollection('Folder', new mongooseMob.Schema({
      name: String,
      parent: { type: mongooseMob.Schema.Types.ObjectId, ref: 'Folder' },
      created: Date
    }))

    return co(function * () {
      yield loadData(10, filesColleciton, foldersCollection)
      const folder = yield foldersCollection.findOne({parent: {$ne: null}})
      const folderId = folder.id
      const files = yield filesColleciton.find({folder: folderId}, null, {castToMongoose: true})
      const populatedFiles = yield mongooseAdapter.populate(files, 'folder', 'folders')
      _.each(populatedFiles, file => {
        expect(file.folder).to.be.an('object')
        expect(file.folder._id).to.not.be.a('null')
      })
      const files2 = yield filesColleciton.find({folder: folderId})
      _.each(files2, file => {
        expect(file.folder).to.be.an('object')
        expect(file.folder).to.not.have.property('created')
      })
    })
  })
})
