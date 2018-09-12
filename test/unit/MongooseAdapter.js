import mockery from 'mockery'

describe('MongooseAdapter', function () {
  let adapter
  let MongooseAdapter
  let sandbox

  beforeEach(function () {
    sandbox = sinon.createSandbox()
    const mongooseMob = {
      getConnection: sandbox.stub().returns({
        base: {
          plugin: sandbox.stub()
        }
      }),
      getModel: sandbox.stub().returns({})
    }
    mockery.registerMock('mongoose-mob', mongooseMob)
    mockery.enable({
      warnOnUnregistered: false,
      useCleanCache: true
    })

    MongooseAdapter = require('../../src/MongooseAdapter').MongooseAdapter
    adapter = new MongooseAdapter('')
  })

  afterEach(function () {
    sandbox.restore()
    mockery.deregisterAll()
    mockery.disable()
  })

  it('should exist', function () {
    expect(adapter).to.be.an('object')
    expect(adapter).to.not.be.a('null')
    expect(adapter).to.not.be.a('undefined')
  })

  it('should throw an error when trying to add a collection with no name', function () {
    expect(() => {
      adapter.addCollection()
    }).to.throw(Error)
  })

  it('should throw an error when trying to add a collection with empty name', function () {
    expect(() => {
      adapter.addCollection('')
    }).to.throw(Error)
  })

  it('should add a collection', function () {
    adapter.addCollection('test', {plugin: sandbox.stub()})
    const collection = adapter.getCollection('test')
    expect(collection).to.be.an('object')
  })

  it('should implement getCollection', function () {
    adapter.collections = {TestCollection: {}}
    expect(() => {
      adapter.getCollection('TestCollection')
    }).to.not.throw()
  })

  it('should throw an error when getCollection is called with an unkown collection', function () {
    adapter.collections = {TestCollection: {}}
    expect(() => {
      adapter.getCollection('TestCollection2')
    }).to.throw(Error)
  })
})
