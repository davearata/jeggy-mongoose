import { MongooseCollection } from '../../src/MongooseCollection'

describe('MongooseCollection', function () {
  let sandbox
  let collection
  let promise
  let resolvedDoc

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    promise = new Promise((resolve) => {
      resolve(resolvedDoc)
    })
    const execObj = {
      exec: sandbox.stub().returns(promise)
    }
    collection = new MongooseCollection('test', {
      find: sandbox.stub().returns(execObj),
      findOne: sandbox.stub().returns(execObj),
      findById: sandbox.stub().returns(execObj),
      create: sandbox.stub(),
      removeWhere: sandbox.stub(),
      remove: sandbox.stub(),
      update: sandbox.stub(),
      count: sandbox.stub().returns(execObj)
    })
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('should throw an error if intiialized without a mongoose model', function () {
    expect(() => {
      const errorTestCollection = new MongooseCollection('errorTest')
      errorTestCollection.find()
    }).to.throw(Error)
  })

  it('should implement find', function () {
    expect(() => {
      collection.find()
    }).to.not.throw()
  })

  it('should implement findOne', function () {
    expect(() => {
      collection.findOne()
    }).to.not.throw()
  })

  it('should implement findById', function () {
    expect(() => {
      collection.findById()
    }).to.not.throw()
  })

  it('should implement create', function () {
    expect(() => {
      collection.create()
    }).to.not.throw()
  })

  it('should implement count', function () {
    expect(() => {
      collection.count()
    }).to.not.throw()
  })

  it('should implement removeWhere', function () {
    expect(() => {
      collection.removeWhere()
    }).to.not.throw()
  })

  it('should implement remove', function () {
    expect(() => {
      collection.remove({_id: 123})
    }).to.not.throw()
  })

  it('should resolve if it can not find the doc to remove', function () {
    return collection.remove({_id: 123}).should.be.fulfilled
  })

  it('should implement update', function () {
    expect(() => {
      collection.update({_id: 123})
    }).to.not.throw()
  })

  it('should throw an error if it can not find the doc to update', function () {
    return collection.update({_id: 123}).should.be.rejectedWith(Error)
  })
})
