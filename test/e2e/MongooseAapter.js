import mongooseMob from 'mongoose-mob';
import { MongooseAdapter } from '../../src/MongooseAdapter';

describe('MongooseAdapter e2e', function () {
  it('should be able to instantiate a schema', function (done) {
    const mongoUri = 'mongodb://localhost/jeggy-mongoose-test';
    const mongooseConnection = mongooseMob.getConnection(mongoUri);
    var mongooseAdapter = new MongooseAdapter(mongooseConnection);
    mongooseAdapter.addCollection('Test', new mongooseMob.Schema({
      arr: [{type: String}]
    }));

    var collection = mongooseAdapter.getCollection('Test');
    collection.create({arr: ['test']})
      .then((testObj) => {
        expect(testObj).to.be.an('object');
        done();
      })
      .then(null, done);
  });
});