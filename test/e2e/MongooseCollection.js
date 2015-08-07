import mongooseMob from 'mongoose-mob';
import { MongooseCollection } from '../../src/MongooseCollection';

describe('MongooseCollection e2e', function () {
  it('should be able to instantiate a schema', function (done) {
    const mongoUri = 'mongodb://localhost/jeggy-mongoose-test';
    const mongooseConnection = mongooseMob.getConnection(mongoUri);
    const mongooseModel = mongooseMob.getModel(mongooseConnection, 'Test', new mongooseMob.Schema({
      arr: [{type: String}]
    }));
    const collection = new MongooseCollection('Test', mongooseModel);
    collection.create({arr: ['test']})
      .then((testObj) => {
        expect(testObj).to.be.an('object');
        done();
      })
      .then(null, done);
  });

  it('should be able to update an object', function (done) {
    const mongoUri = 'mongodb://localhost/jeggy-mongoose-test';
    const mongooseConnection = mongooseMob.getConnection(mongoUri);
    const mongooseModel = mongooseMob.getModel(mongooseConnection, 'Test', new mongooseMob.Schema({
      arr: [{type: String}]
    }));
    const collection = new MongooseCollection('Test', mongooseModel);
    collection.create({arr: ['test']})
      .then((testObj) => {
        testObj.arr = ['new test'];
        return collection.update(testObj);
      })
      .then(updated => {
        expect(updated).to.be.an('object');
        expect(updated.arr[0]).to.be.equal('new test');
        done();
      })
      .then(null, done);
  });

  it('should be able to update a field to null', function (done) {
    const mongoUri = 'mongodb://localhost/jeggy-mongoose-test';
    const mongooseConnection = mongooseMob.getConnection(mongoUri);
    const mongooseModel = mongooseMob.getModel(mongooseConnection, 'Test', new mongooseMob.Schema({
      arr: [{type: String}]
    }));
    const collection = new MongooseCollection('Test', mongooseModel);
    collection.create({arr: ['test']})
      .then((testObj) => {
        testObj.arr = undefined;
        return collection.update(testObj);
      })
      .then(updated => {
        expect(updated).to.be.an('object');
        expect(updated.arr).to.be.equal(undefined);
        done();
      })
      .then(null, done);
  });
});