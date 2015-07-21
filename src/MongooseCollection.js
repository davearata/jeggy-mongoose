import { Collection } from 'jeggy';
import _ from 'lodash';

export class MongooseCollection extends Collection {
  constructor(name, mongooseModel) {
    super(name);
    if(!mongooseModel) {
      throw new Error('a MongooseCollection must be intiialized with a mongoose model');
    }
    this.mongooseModel = mongooseModel;
  }

  find(query, projection) {
    return this.mongooseModel.find(query, projection).exec();
  }

  findOne(query, projection) {
    return this.mongooseModel.findOne(query, projection).exec();
  }

  findById(id, projection) {
    return this.mongooseModel.findById(id, projection).exec();
  }

  create(doc) {
    return this.mongooseModel.create(doc);
  }

  removeWhere(query) {
    return this.mongooseModel.remove(query);
  }

  remove(doc) {
    return this.mongooseModel.findById(doc._id).exec()
      .then((foundDoc) => {
        if(!foundDoc) {
          throw new Error('trying to remove doc that does not exist id:' + doc._id);
        }

        return foundDoc.remove();
      });
  }

  update(doc) {
    return this.mongooseModel.findById(doc._id).exec()
      .then((foundDoc) => {
        if(!foundDoc) {
          throw new Error('trying to update doc that does not exist id:' + doc._id);
        }

        doc = _.omit(doc, '_id');
        doc = _.omit(doc, '__v');
        foundDoc = _.merge(foundDoc.toObject(), doc);
        _.forEach(_.keys(doc), key => {
          foundDoc.markModified(key);
        });
        return foundDoc.save();
      });
  }
}
