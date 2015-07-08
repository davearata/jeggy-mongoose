import mongooseMob from 'mongoose-mob';
import _ from 'lodash';
import { MongooseAdapter } from '../../src/MongooseAdapter';
import loadData from '../util/loadFakeData';

const mongoUri = 'mongodb://localhost/jeggy-mongoose-test';
const mongooseConnection = mongooseMob.getConnection(mongoUri);

describe('MongooseAdapter e2e', function () {
  let mongooseAdapter;

  beforeEach(() => {
    mongooseAdapter = new MongooseAdapter(mongooseConnection);
  });

  it('should be able to instantiate a schema', (done) => {

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

  it('should populate documents', (done) => {
    this.timeout(5000);
    const filesColleciton = mongooseAdapter.addCollection('File', new mongooseMob.Schema({
      name: String,
      folder: { type: mongooseMob.Schema.Types.ObjectId, ref: 'Folder', required: true},
      created: Date,
      url: String
    }));
    const foldersCollection = mongooseAdapter.addCollection('Folder', new mongooseMob.Schema({
      name: String,
      parent: { type: mongooseMob.Schema.Types.ObjectId, ref: 'Folder'},
      created: Date
    }));
    let folderId;

    loadData(10, filesColleciton, foldersCollection)
      .then(() => {
        return foldersCollection.findOne({parent: {$ne: null}});
      })
      .then((folder) => {
        folderId = folder.id;
        return filesColleciton.find({folder: folderId});
      })
      .then((files) => {
        return mongooseAdapter.populate(files, 'folder', 'folders');
      })
      .then((files) => {
        _.each(files, file => {
          expect(file.folder).to.be.an('object');
          expect(file.folder._id).to.not.be.a('null');
        });
      })
      .then(() => {
        return filesColleciton.find({folder: folderId});
      })
      .then((files) => {
        _.each(files, file => {
          expect(file.folder).to.be.an('object');
          expect(file.folder).to.not.have.property('created');
        });
        done();
      })
      .then(null, done);
  });
});