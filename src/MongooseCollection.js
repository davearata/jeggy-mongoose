import _ from 'lodash'
import co from 'co'
import { Collection } from 'jeggy'

export class MongooseCollection extends Collection {
  constructor (name, mongooseModel) {
    super(name)
    if (!mongooseModel) {
      throw new Error('a MongooseCollection must be intiialized with a mongoose model')
    }
    this.mongooseModel = mongooseModel
  }

  addToSet (doc, arrayKey, value) {
    return co.call(this, function * () {
      const updateObj = {}
      updateObj[arrayKey] = value
      const res = yield this.mongooseModel.collection.update({_id: doc._id}, {$addToSet: updateObj})
      return res.result
    })
  }

  addToSetByQuery (query, arrayKey, value) {
    return co.call(this, function * () {
      const updateObj = {}
      updateObj[arrayKey] = value
      const res = yield this.mongooseModel.collection.update(query, {$addToSet: updateObj}, {multi: true})
      return res.result
    })
  }

  aggregate (expression) {
    if (!_.isObject(expression) || !_.isArray(expression)) {
      throw new Error('Aggregate needs an expression or array of expressions to aggregate by')
    }
    return this.mongooseModel.aggregate(expression).exec()
  }

  find (query, projection, queryOptions, sortString) {
    queryOptions = queryOptions || {}
    const options = {
      lean: queryOptions.castToMongoose !== true,
      limit: queryOptions.limit,
      skip: queryOptions.offset
    }
    let mongoQuery = this.mongooseModel.find(query, projection, options)
    if (sortString) {
      mongoQuery = mongoQuery.sort(sortString)
    }
    return mongoQuery.exec()
  }

  findStream (query, transformFunc, projection, queryOptions, populateField, populateProjection, sortString) {
    queryOptions = queryOptions || {}
    const options = {
      lean: queryOptions.castToMongoose !== true,
      limit: queryOptions.limit,
      skip: queryOptions.offset
    }
    const mongoQuery = this.mongooseModel.find(query, projection, options)
    const transformObj = {}
    if (_.isFunction(transformFunc)) {
      transformObj.transform = transformFunc
    }
    if (_.isString(populateField)) {
      return mongoQuery.populate(populateField, populateProjection).sort(sortString).stream(transformObj)
    }
    return mongoQuery.sort(sortString).stream(transformObj)
  }

  findOne (query, projection, sortString, queryOptions) {
    queryOptions = queryOptions || {}
    const options = {
      lean: queryOptions.castToMongoose !== true
    }
    query = this.mongooseModel.findOne(query, projection, options)
    if (sortString) {
      query = query.sort(sortString)
    }
    return query.exec()
  }

  findById (id, projection, queryOptions) {
    queryOptions = queryOptions || {}
    const options = {
      lean: queryOptions.castToMongoose !== true
    }
    return this.mongooseModel.findById(id, projection, options).exec()
  }

  create (doc) {
    return this.mongooseModel.create(doc)
  }

  count (query) {
    return this.mongooseModel.count(query).exec()
  }

  insertMany (docs) {
    return new Promise((resolve, reject) => {
      this.mongooseModel.collection.insertMany(docs, {}, (err, result) => {
        if (err) {
          return reject(err)
        }

        resolve(result.ops)
      })
    })
  }

  pull (doc, pullQuery) {
    return co.call(this, function * () {
      const res = yield this.mongooseModel.collection.update({_id: doc._id}, {$pull: pullQuery})
      return res.result
    })
  }

  pullByQuery (query, pullQuery) {
    return co.call(this, function * () {
      const res = yield this.mongooseModel.collection.update(query, {$pull: pullQuery}, {multi: true})
      return res.result
    })
  }

  rawUpdate (findQuery, updateQuery) {
    return this.mongooseModel.collection.update(findQuery, updateQuery)
  }

  removeWhere (query) {
    return this.mongooseModel.remove(query)
  }

  remove (doc) {
    return co.call(this, function * () {
      const foundDoc = yield this.mongooseModel.findById(doc._id).exec()
      if (!foundDoc) {
        return
      }

      return foundDoc.remove()
    })
  }

  update (doc) {
    return co.call(this, function * () {
      const foundDoc = yield this.mongooseModel.findById(doc._id).exec()
      if (!foundDoc) {
        throw new Error('trying to update doc that does not exist id: ' + doc._id)
      }

      if (_.isFunction(doc.toObject)) {
        doc = doc.toObject()
      }
      foundDoc.merge(doc, {virtuals: true})
      try {
        return foundDoc.save()
      } catch (err) {
        if (err.name === 'VersionError') {
          return this.update(foundDoc)
        }
        return Promise.reject(err)
      }
    })
  }

  updateMany (ids, update) {
    return this.mongooseModel.update({_id: {$in: ids}}, update, {multi: true}).exec()
  }

  incrementField (doc, incrementField, incrementValue) {
    return co.call(this, function * () {
      const foundDoc = yield this.mongooseModel.findById(doc._id).exec()
      if (!foundDoc) {
        throw new Error('trying to update doc that does not exist id: ' + doc._id)
      }
      const incrementOperator = {$inc: {}}
      incrementOperator.$inc[incrementField] = incrementValue
      return this.mongooseModel.update({_id: foundDoc._id}, incrementOperator).exec()
    })
  }
}
