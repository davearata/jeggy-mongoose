import { Adapter } from 'jeggy';
import mongooseMob from 'mongoose-mob';
import _ from 'lodash';

import { MongooseCollection } from './MongooseCollection';

const populateDoc = function populateDoc(doc, fieldKey) {
  return new Promise((resolve, reject) => {
    doc.populate(fieldKey, (error) => {
      if(error) {
        return reject(error);
      }

      resolve(doc);
    });
  });
};

export class MongooseAdapter extends Adapter {
  constructor(mongooseConnection) {
    super();
    if (_.isString(mongooseConnection)) {
      mongooseConnection = mongooseMob.getConnection(mongooseConnection);
    }

    this.mongooseConnection = mongooseConnection;
    this.collections = {};
  }

  addCollection(name, schema) {
    let collection;
    if (name instanceof MongooseCollection) {
      collection = name;
      name = collection.name;
    } else {
      if (!_.isString(name) || _.isEmpty(name)) {
        throw new Error('must provide a name when adding a collection');
      }
      const mongooseModel = mongooseMob.getModel(this.mongooseConnection, name, schema);
      collection = new MongooseCollection(name, mongooseModel);
    }

    this.collections[name] = collection;
    return collection;
  }

  getCollection(name) {
    if (!this.collections[name]) {
      throw new Error('unknown collection: ' + name);
    }
    return this.collections[name];
  }

  getCollections() {
    return this.collections;
  }

  populate(docs, fieldKey) {
    if (!docs) {
      throw new Error('tried to populate a null value');
    }

    if (!_.isArray(docs)) {
      docs = [docs];
    }

    const promises = _.map(docs, doc => {
      return populateDoc(doc, fieldKey);
    });

    return Promise.all(promises)
      .then(() => {
        return docs;
      });
  }
}
