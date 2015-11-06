import { MongooseCollection } from '../../src/MongooseCollection';

describe('MongooseCollection', () => {
  let sandbox;
  let collection;
  let promise;
  let resolvedDoc;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    promise = new Promise((resolve) => {
      resolve(resolvedDoc);
    });
    const execObj = {
      exec: sandbox.stub().returns(promise)
    };
    collection = new MongooseCollection('test', {
      find: sandbox.stub().returns(execObj),
      findOne: sandbox.stub().returns(execObj),
      findById: sandbox.stub().returns(execObj),
      create: sandbox.stub(),
      removeWhere: sandbox.stub(),
      remove: sandbox.stub(),
      update: sandbox.stub(),
      count: sandbox.stub().returns(execObj)
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should throw an error if intiialized without a mongoose model', () => {
    expect(() => {
      const errorTestCollection = new MongooseCollection('errorTest');
      errorTestCollection.find();
    }).to.throw(Error);
  });

  it('should implement find', () => {
    expect(() => {
      collection.find();
    }).to.not.throw();
  });

  it('should implement findOne', () => {
    expect(() => {
      collection.findOne();
    }).to.not.throw();
  });

  it('should implement findById', () => {
    expect(() => {
      collection.findById();
    }).to.not.throw();
  });

  it('should implement create', () => {
    expect(() => {
      collection.create();
    }).to.not.throw();
  });

  it('should implement count', () => {
    expect(() => {
      collection.count();
    }).to.not.throw();
  });

  it('should implement removeWhere', () => {
    expect(() => {
      collection.removeWhere();
    }).to.not.throw();
  });

  it('should implement remove', () => {
    expect(() => {
      collection.remove({_id: 123});
    }).to.not.throw();
  });

  it('should resolve if it can not find the doc to remove', (done) => {
    collection.remove({_id: 123})
      .then(() => {
        done();
      })
      .then(null, (reason) => {
        done(reason);
      });
  });

  it('should implement update', () => {
    expect(() => {
      collection.update({_id: 123});
    }).to.not.throw();
  });

  it('should throw an error if it can not find the doc to update', (done) => {
    collection.update({_id: 123})
      .then(() => {
        done(new Error('this should not have resolved'));
      })
      .then(null, (reason) => {
        expect(reason).to.be.an('error');
        done();
      });
  });

});
