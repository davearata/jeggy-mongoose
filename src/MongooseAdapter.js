import { Adapter } from 'jeggy';
import mongooseMob from 'mongoose-mob';
import _ from 'lodash';

import { MongooseCollection } from './MongooseCollection';

export class MongooseAdapter extends Adapter {
  constructor(mongooseConnection) {
    super();
    if(_.isString(mongooseConnection)) {
      mongooseConnection = mongooseMob.getConnection(mongooseConnection);
    }

    this.mongooseConnection = mongooseConnection;
    this.collections = {};
  }

  addCollection(name, schema) {
    let collection;
    if(name instanceof MongooseCollection) {
      collection = name;
      name = collection.name;
    } else {
      if(!_.isString(name) || _.isEmpty(name)) {
        throw new Error('must provide a name when adding a collection');
      }
      const mongooseModel = mongooseMob.getModel(this.mongooseConnection, name, schema);
      collection = new MongooseCollection(name, mongooseModel);
    }

    this.collections[name] = collection;
  }

  getCollection(name) {
    if(!this.collections[name]) {
      throw new Error('unknown collection: ' + name);
    }
    return this.collections[name];
  }

  getCollections() {
    return this.collections;
  }
}
