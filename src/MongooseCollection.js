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

  find(query, projection, queryOptions) {
    queryOptions = queryOptions || {};
    const options = {
      lean: queryOptions.castToMongoose !== true,
      limit: queryOptions.limit,
      skip: queryOptions.offset
    };
    const mongoQuery = this.mongooseModel.find(query, projection, options);
    return mongoQuery.exec();
  }

  findStream(query, transformFunc, projection, queryOptions) {
    queryOptions = queryOptions || {};
    const options = {
      lean: queryOptions.castToMongoose !== true,
      limit: queryOptions.limit,
      skip: queryOptions.offset
    };
    const mongoQuery = this.mongooseModel.find(query, projection, options);
    const transformObj = {};
    if(_.isFunction(transformFunc)) {
      transformObj.transform = transformFunc;
    }
    return mongoQuery.stream(transformObj);
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

  count(query) {
    return this.mongooseModel.count(query).exec();
  }

  insertMany(docs) {
    return new Promise((resolve, reject) => {
      this.mongooseModel.collection.insertMany(docs, {}, (err, result) => {
        if (err) {
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
          return Promise.resolve();
        }

        return foundDoc.remove();
      });
  }

  update(doc) {
    const _update = this.update.bind(this);
    return this.mongooseModel.findById(doc._id).exec()
      .then((foundDoc) => {
        if(!foundDoc) {
          throw new Error('trying to update doc that does not exist id: ' + doc._id);
        }

        if(_.isFunction(doc.toObject)) {
          doc = doc.toObject();
        }
        foundDoc.merge(doc);
        return foundDoc.save()
          .then(null, reason => {
            if(reason.name === 'VersionError') {
              return _update(foundDoc);
            }
            return Promise.reject(reason);
          });
      });
  }

  updateMany(ids, update) {
    return this.mongooseModel.update({_id: {$in: ids}}, update, {multi: true}).exec();
  }

  incrementField(doc, incrementField, incrementValue) {
    return this.mongooseModel.findById(doc._id).exec()
      .then((foundDoc) => {
        if(!foundDoc) {
          throw new Error('trying to update doc that does not exist id: ' + doc._id);
        }
        const incrementOperator = {$inc: {}};
        incrementOperator.$inc[incrementField] = incrementValue;
        return this.mongooseModel.update({_id: foundDoc._id}, incrementOperator).exec();
      });
  }
}
