import _ from 'lodash'
import mongooseMob from 'mongoose-mob'
import merge from 'mongoose-merge-plugin'
import { MongooseCollection } from '../../src/MongooseCollection'

const mongoUri = 'mongodb://localhost/jeggy-mongoose-test'
const mongooseConnection = mongooseMob.getConnection(mongoUri)
mongooseConnection.base.plugin(merge)
const mongooseModel = mongooseMob.getModel(mongooseConnection, 'Test', new mongooseMob.Schema({
  arr: [{type: String}],
  data: {
    str: {type: String}
  }
}))
const collection = new MongooseCollection('Test', mongooseModel)

describe('MongooseCollection e2e', () => {
  beforeEach((done) => {
    collection.removeWhere()
      .then(() => {
        done()
      })
      .then(null, done)
  })

  it('should be able to instantiate a schema', done => {
    collection.create({arr: ['test']})
      .then(testObj => {
        expect(testObj).to.be.an('object')
        done()
      })
      .then(null, done)
  })

  it('should be able to limit a find query', done => {
    const docs = [
      {arr: ['test']},
      {arr: ['test1']},
      {arr: ['test2']}
    ]
    collection.insertMany(docs)
      .then(() => {
        return collection.find({}, null, {limit: 1})
      })
      .then(result => {
        expect(result.length).to.equal(1)
        done()
      })
      .then(null, done)
  })

  it('should be able to offset a find query', done => {
    const docs = [
      {arr: ['test']},
      {arr: ['test1']},
      {arr: ['test2']}
    ]
    collection.insertMany(docs)
      .then(() => {
        return collection.find({}, null, {offset: 1})
      })
      .then(result => {
        expect(result.length).to.equal(2)
        expect(result[0].arr[0]).to.equal('test1')
        done()
      })
      .then(null, done)
  })

  it('should be able to count', done => {
    const docs = [
      {arr: ['test'], data: {str: 'foo'}},
      {arr: ['test1'], data: {str: 'foo'}},
      {arr: ['test2'], data: {str: 'bar'}}
    ]
    collection.insertMany(docs)
      .then(() => {
        return collection.count()
      })
      .then(count => {
        expect(count).to.equal(3)
        return collection.count({'data.str': 'foo'})
      })
      .then(result => {
        expect(result).to.equal(2)
        done()
      })
      .then(null, done)
  })

  it('should be able to update an object', done => {
    collection.create({arr: ['test'], data: {str: 'abc123'}})
      .then((testObj) => {
        testObj.arr = ['new test']
        testObj.data.str = '12345'
        return collection.update(testObj)
      })
      .then(updated => {
        expect(updated).to.be.an('object')
        expect(updated.arr[0]).to.be.equal('new test')
        expect(updated.data.str).to.be.equal('12345')
        done()
      })
      .then(null, done)
  })

  it('should be able to update a field to null', done => {
    collection.create({arr: ['test'], data: {str: 'abc123'}})
      .then((testObj) => {
        testObj.arr = null
        testObj.data.str = null
        return collection.update(testObj)
      })
      .then(updated => {
        expect(updated).to.be.an('object')
        expect(updated.arr).to.be.equal(null)
        expect(updated.data.str).to.be.equal(null)
        done()
      })
      .then(null, done)
  })

  it('should be able to create many objects', done => {
    const docs = [
      {arr: ['test']},
      {arr: ['test1']},
      {arr: ['test2']}
    ]
    collection.insertMany(docs)
      .then((result) => {
        expect(result).to.be.an('array')
        expect(result.length).to.equal(3)
        done()
      })
      .then(null, done)
  })

  it('should be able to update many objects', done => {
    const docs = [
      {arr: ['test']},
      {arr: ['test1']},
      {arr: ['test2']}
    ]
    let ids
    collection.insertMany(docs)
      .then(result => {
        ids = _.pluck(result, '_id')
        return collection.updateMany(ids, {$set: {'data.str': 'abc'}, $addToSet: {arr: '1234'}})
      })
      .then(result => {
        expect(result.nModified).to.equal(3)
        return collection.find({_id: {$in: ids}})
      })
      .then(updated => {
        _.forEach(updated, item => {
          expect(item.data.str).to.equal('abc')
          expect(item.arr.length).to.equal(2)
          expect(_.includes(item.arr, '1234')).to.equal(true)
        })
        done()
      })
      .then(null, done)
  })
})
