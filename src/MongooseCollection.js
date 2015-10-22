import _ from 'lodash';
import { Collection } from 'jeggy';

export class MongooseCollection extends Collection {
  constructor(name, mongooseModel) {
    super(name);
    if(!mongooseModel) {
      throw new Error('a MongooseCollection must be intiialized with a mongoose model');
    }
    this.mongooseModel = mongooseModel;
  }

  find(query, projection, castToMongoose) {
    let mongoQuery = this.mongooseModel.find(query, projection);
    if(castToMongoose !== true) {
      mongoQuery = mongoQuery.lean();
    }
    return mongoQuery.exec();
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

  insertMany(docs) {
    return new Promise((resolve, reject) => {
      this.mongooseModel.collection.insertMany(docs, {}, (err, result) => {
        if(err) {
          return reject(err);
        }

        resolve(result.ops);
      });
    });
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

        if(_.isFunction(doc.toObject)) {
          doc = doc.toObject();
        }
        foundDoc.merge(doc);
        return foundDoc.save();
      });
  }

  updateMany(ids, update) {
    return this.mongooseModel.update({_id: {$in: ids}}, update, {multi: true}).exec();
  }
}
