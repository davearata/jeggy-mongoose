import _ from 'lodash'
import co from 'co'
import mongooseMob from 'mongoose-mob'
import merge from 'mongoose-merge-plugin'
import { MongooseCollection } from '../../src/MongooseCollection'

const mongoUri = 'mongodb://localhost/jeggy-mongoose-test'
const mongooseConnection = mongooseMob.getConnection(mongoUri)
mongooseConnection.base.plugin(merge)
const testSchema = new mongooseMob.Schema({
  arr: [{type: String}],
  account: Number,
  item: Number,
  date: Number,
  itemType: String,
  data: {
    str: {type: String}
  },
  nonVirtualField: {type: String}
})

const documentArraySchema = new mongooseMob.Schema({
  arr: [
    {user: String, priority: Number}
  ],
  data: {
    str: {type: String}
  }
})

const postSchema = new mongooseMob.Schema({
  title: String,
  author: { type: mongooseMob.Schema.Types.ObjectId, required: true, ref: 'User' }
})

const userSchema = new mongooseMob.Schema({
  name: { type: String, required: true },
  posts: [
    { type: mongooseMob.Schema.Types.ObjectId, required: true, ref: 'Post' }
  ]
})

testSchema.virtual('virtualField').set(function (virtualField) {
  this._virt = virtualField
  this.nonVirtualField = virtualField
}).get(function () {
  return this._virt
})

const mongooseModel = mongooseMob.getModel(mongooseConnection, 'Test', testSchema)
const collection = new MongooseCollection('Test', mongooseModel)

const documentArrayModel = mongooseMob.getModel(mongooseConnection, 'Test1', documentArraySchema)
const documentArrayCollection = new MongooseCollection('Test1', documentArrayModel)

const postsModel = mongooseMob.getModel(mongooseConnection, 'Post', postSchema)
const postCollection = new MongooseCollection('Post', postsModel)

const usersModel = mongooseMob.getModel(mongooseConnection, 'User', userSchema)
const userCollection = new MongooseCollection('User', usersModel)

describe('MongooseCollection e2e', function () {
  beforeEach(function (done) {
    collection.removeWhere()
      .then(() => documentArrayCollection.removeWhere())
      .then(() => postCollection.removeWhere())
      .then(() => userCollection.removeWhere())
      .then(() => done())
      .then(null, done)
  })

  it('should be able to instantiate a schema', function () {
    expect(collection.create({arr: ['test']})).to.eventually.be.an('object')
  })

  it('should be able to limit a find query', function () {
    const docs = [
      {arr: ['test']},
      {arr: ['test1']},
      {arr: ['test2']}
    ]

    return co(function * () {
      yield collection.insertMany(docs)
      const result = yield collection.find({}, null, {limit: 1})
      expect(result.length).to.equal(1)
    })
  })

  it('should be able to offset a find query', function () {
    const docs = [
      {arr: ['test']},
      {arr: ['test1']},
      {arr: ['test2']}
    ]
    return co(function * () {
      yield collection.insertMany(docs)
      const result = yield collection.find({}, null, {offset: 1})
      expect(result.length).to.equal(2)
      expect(result[0].arr[0]).to.equal('test1')
    })
  })

  it('should be able to count', function () {
    const docs = [
      {arr: ['test'], data: {str: 'foo'}},
      {arr: ['test1'], data: {str: 'foo'}},
      {arr: ['test2'], data: {str: 'bar'}}
    ]
    return co(function * () {
      yield collection.insertMany(docs)
      const count = yield collection.count()
      expect(count).to.equal(3)
      const result = yield collection.count({'data.str': 'foo'})
      expect(result).to.equal(2)
    })
  })

  it('should be able to update an object', function () {
    return co(function * () {
      const testObj = yield collection.create({arr: ['test'], data: {str: 'abc123'}})
      testObj.arr = ['new test']
      testObj.data.str = '12345'
      const updated = yield collection.update(testObj)
      expect(updated).to.be.an('object')
      expect(updated.arr[0]).to.be.equal('new test')
      expect(updated.data.str).to.be.equal('12345')
    })
  })

  it('should be able to update an object\'s virtual field', function () {
    return co(function * () {
      const testObj = yield collection.create({arr: ['test'], data: {str: 'abc123'}})
      testObj.virtualField = 'this should save'
      const updated = yield collection.update(testObj)
      expect(updated.nonVirtualField).to.equal('this should save')
    })
  })

  it('should be able to update a field to null', function () {
    return co(function * () {
      const testObj = yield collection.create({arr: ['test'], data: {str: 'abc123'}})
      testObj.arr = null
      testObj.data.str = null
      const updated = yield collection.update(testObj)
      expect(updated).to.be.an('object')
      expect(updated.arr).to.be.equal(null)
      expect(updated.data.str).to.be.equal(null)
    })
  })

  it('should be able to create many objects', function () {
    const docs = [
      {arr: ['test']},
      {arr: ['test1']},
      {arr: ['test2']}
    ]
    return co(function * () {
      const result = yield collection.insertMany(docs)
      expect(result).to.be.an('array')
      expect(result.length).to.equal(3)
    })
  })

  it('should be able to update many objects', function () {
    const docs = [
      {arr: ['test']},
      {arr: ['test1']},
      {arr: ['test2']}
    ]

    return co(function * () {
      const result = yield collection.insertMany(docs)
      const ids = _.map(result, '_id')
      const updatedResult = yield collection.updateMany(ids, {$set: {'data.str': 'abc'}, $addToSet: {arr: '1234'}})
      expect(updatedResult.nModified).to.equal(3)
      const updated = yield collection.find({_id: {$in: ids}})
      _.forEach(updated, item => {
        expect(item.data.str).to.equal('abc')
        expect(item.arr.length).to.equal(2)
        expect(_.includes(item.arr, '1234')).to.equal(true)
      })
    })
  })

  it('should be able to addToSet by query', function () {
    const docs = [
      {arr: ['test']},
      {arr: ['test1']},
      {arr: ['test2']}
    ]
    return co(function * () {
      const result = yield collection.insertMany(docs)
      const ids = _.map(result, '_id')
      const addToSetByQueryResult = yield collection.addToSetByQuery({_id: {$in: ids}}, 'arr', 'newvalue')
      expect(addToSetByQueryResult.nModified).to.equal(3)
      const updated = yield collection.find({_id: {$in: ids}})
      _.forEach(updated, item => {
        expect(item.arr.length).to.equal(2)
        expect(_.includes(item.arr, 'newvalue')).to.equal(true)
      })
    })
  })

  it('should be able to addToSet for a single doc without a query', function () {
    const doc = {arr: ['test']}
    return co(function * () {
      const result = yield collection.create(doc)
      const addToSetResult = yield collection.addToSet(result, 'arr', 'newvalue')
      expect(addToSetResult.nModified).to.equal(1)
      const updatedDoc = yield collection.findOne({_id: result._id})
      expect(updatedDoc.arr.length).to.equal(2)
      expect(_.includes(updatedDoc.arr, 'newvalue')).to.equal(true)
    })
  })

  it('should be able to pull by query', function () {
    const docs = [
      {arr: ['test']},
      {arr: ['test']},
      {arr: ['test']}
    ]
    return co(function * () {
      const result = yield collection.insertMany(docs)
      const ids = _.map(result, '_id')
      const pullByQueryResult = yield collection.pullByQuery({_id: {$in: ids}}, {arr: 'test'})
      expect(pullByQueryResult.nModified).to.equal(3)
      const updated = yield collection.find({_id: {$in: ids}})
      _.forEach(updated, item => {
        expect(item.arr.length).to.equal(0)
        expect(_.includes(item.arr, 'test')).to.equal(false)
      })
    })
  })

  it('should be able to pull for a single doc without a query', function () {
    const doc = {arr: ['test']}
    return co(function * () {
      const result = yield collection.create(doc)
      const pullResult = yield collection.pull(result, {arr: 'test'})
      expect(pullResult.nModified).to.equal(1)
      const updatedDoc = yield collection.findOne({_id: result._id})
      expect(updatedDoc.arr.length).to.equal(0)
      expect(_.includes(updatedDoc.arr, 'test')).to.equal(false)
    })
  })

  it('should should not add the document to the set because the query should filter the document out', function () {
    const doc = {arr: [{user: 'me', priority: Date.now()}]}
    return co(function * () {
      const result = yield documentArrayCollection.create(doc)
      yield documentArrayCollection.addToSetByQuery({_id: result._id, 'arr.user': {$ne: 'me'}}, 'arr', {user: 'me', priorty: Date.now()})
      const updated = yield documentArrayCollection.findOne({_id: result._id})
      updated.arr.length.should.equal(1)
    })
  })

  it('should add the document to the set because the query should not filter the document out', function () {
    const doc = {arr: [{user: 'me', priority: Date.now()}]}
    return co(function * () {
      const result = yield documentArrayCollection.create(doc)
      yield documentArrayCollection.addToSetByQuery({_id: result._id}, 'arr', {user: 'me', priorty: Date.now()})
      const updated = yield documentArrayCollection.findOne({_id: result._id})
      updated.arr.length.should.equal(2)
    })
  })

  it('should be able to pull a document in an array by query', function () {
    const doc = {arr: [{user: 'me', priority: Date.now()}, {user: 'you', priority: Date.now()}]}
    return co(function * () {
      const result = yield documentArrayCollection.create(doc)
      yield documentArrayCollection.pullByQuery({_id: result._id}, {arr: {user: 'you'}})
      const updated = yield documentArrayCollection.findOne(result._id)
      updated.arr.length.should.equal(1)
      updated.arr[0].user.should.equal('me')
    })
  })

  it('should be able to populate a stream', function (done) {
    co(function * () {
      const userDoc = {name: 'Test User'}
      const createdUser = yield userCollection.create(userDoc)
      const postDoc = {title: 'Test Post', author: createdUser._id}
      yield postCollection.create(postDoc)

      const stream = postCollection.findStream({}, undefined, undefined, undefined, 'author', 'name')

      stream.on('data', function (doc) {
        doc.author.name.should.equal('Test User')
        done()
      })

      stream.on('error', function (err) {
        done(err)
      })
    })
  })

  it('should be able to aggregate', function () {
    const docs = [{
      account: 1,
      item: 1,
      date: 2,
      itemType: 'CONTENT'

    },
    {
      account: 2,
      item: 1,
      date: 2,
      itemType: 'CONTENT'

    },
    {
      account: 1,
      item: 1,
      date: 2,
      itemType: 'CONTENT'

    },
    {
      account: 1,
      item: 1,
      date: 1,
      itemType: 'CONTENT'

    },
    {
      account: 1,
      item: 2,
      date: 4,
      itemType: 'CONTENT'

    }
    ]

    return co(function* () {
      yield collection.insertMany(docs)

      const exp = [
        {
          $match: {
            account: 1
          }
        }, {
          $group: {
            _id: '$item',
            item: {
              $first: '$item'
            },
            itemType: {$first: '$itemType'},
            sum: {
              $sum: 1
            }
          }
        }, {
          $sort: {
            sum: -1

          }
        }
      ]
      const aggResult = yield collection.aggregate(exp)
      aggResult.length.should.equal(2)
      aggResult[0].sum.should.equal(3)
      aggResult[1].sum.should.equal(1)
    })
  })
})
