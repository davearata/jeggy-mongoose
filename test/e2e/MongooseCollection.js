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
  data: {
    str: {type: String}
  },
  nonVirtualField: {type: String}
})

testSchema.virtual('virtualField').set(function (virtualField) {
  this._virt = virtualField
  this.nonVirtualField = virtualField
}).get(function () {
  return this._virt
})

const mongooseModel = mongooseMob.getModel(mongooseConnection, 'Test', testSchema)
const collection = new MongooseCollection('Test', mongooseModel)

describe('MongooseCollection e2e', function () {
  beforeEach(function (done) {
    collection.removeWhere()
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
})
