import mongooseMob from 'mongoose-mob';
import { MongooseCollection } from '../../src/MongooseCollection';

const mongoUri = 'mongodb://localhost/jeggy-mongoose-test';
const mongooseConnection = mongooseMob.getConnection(mongoUri);
const mongooseModel = mongooseMob.getModel(mongooseConnection, 'Test', new mongooseMob.Schema({
  arr: [{type: String}],
  data: {
    str: String
  }
}));
const collection = new MongooseCollection('Test', mongooseModel);

describe('MongooseCollection e2e', function () {
  it('should be able to instantiate a schema', function (done) {
    collection.create({arr: ['test']})
      .then((testObj) => {
        expect(testObj).to.be.an('object');
        done();
      })
      .then(null, done);
  });

  it('should be able to update an object', function (done) {
    collection.create({arr: ['test'], data: {str: 'abc123'}})
      .then((testObj) => {
        testObj.arr = ['new test'];
        testObj.data.str = '12345';
        return collection.update(testObj);
      })
      .then(updated => {
        expect(updated).to.be.an('object');
        expect(updated.arr[0]).to.be.equal('new test');
        expect(updated.data.str).to.be.equal('12345');
        done();
      })
      .then(null, done);
  });

  it('should be able to update a field to undefined', function (done) {
    collection.create({arr: ['test'], data: {str: 'abc123'}})
      .then((testObj) => {
        testObj.arr = undefined;
        testObj.data.str = undefined;
        return collection.update(testObj);
      })
      .then(updated => {
        expect(updated).to.be.an('object');
        expect(updated.arr).to.be.equal(undefined);
        expect(updated.data.str).to.be.equal(undefined);
        done();
      })
      .then(null, done);
  });

  it('should be able to update a field to null', function (done) {
    collection.create({arr: ['test'], data: {str: 'abc123'}})
      .then((testObj) => {
        testObj.arr = null;
        testObj.data.str = null;
        return collection.update(testObj);
      })
      .then(updated => {
        expect(updated).to.be.an('object');
        expect(updated.arr).to.be.equal(null);
        expect(updated.data.str).to.be.equal(null);
        done();
      })
      .then(null, done);
  });
});