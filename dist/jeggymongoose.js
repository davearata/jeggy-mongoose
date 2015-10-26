var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lodash'), require('jeggy'), require('mongoose-mob'), require('mongoose-merge-plugin')) : typeof define === 'function' && define.amd ? define(['exports', 'lodash', 'jeggy', 'mongoose-mob', 'mongoose-merge-plugin'], factory) : factory(global.jeggymongoose = {}, global._, global.jeggy, global.mongooseMob, global.merge);
})(this, function (exports, _, jeggy, mongooseMob, merge) {
  'use strict';

  _ = 'default' in _ ? _['default'] : _;
  mongooseMob = 'default' in mongooseMob ? mongooseMob['default'] : mongooseMob;
  merge = 'default' in merge ? merge['default'] : merge;

  var MongooseCollection = (function (_jeggy$Collection) {
    _inherits(MongooseCollection, _jeggy$Collection);

    function MongooseCollection(name, mongooseModel) {
      _classCallCheck(this, MongooseCollection);

      _get(Object.getPrototypeOf(MongooseCollection.prototype), 'constructor', this).call(this, name);
      if (!mongooseModel) {
        throw new Error('a MongooseCollection must be intiialized with a mongoose model');
      }
      this.mongooseModel = mongooseModel;
    }

    _createClass(MongooseCollection, [{
      key: 'find',
      value: function find(query, projection, queryOptions) {
        queryOptions = queryOptions || {};
        var options = {
          lean: queryOptions.castToMongoose !== true,
          limit: queryOptions.limit,
          skip: queryOptions.offset
        };
        var mongoQuery = this.mongooseModel.find(query, projection, options);
        return mongoQuery.exec();
      }
    }, {
      key: 'findOne',
      value: function findOne(query, projection) {
        return this.mongooseModel.findOne(query, projection).exec();
      }
    }, {
      key: 'findById',
      value: function findById(id, projection) {
        return this.mongooseModel.findById(id, projection).exec();
      }
    }, {
      key: 'create',
      value: function create(doc) {
        return this.mongooseModel.create(doc);
      }
    }, {
      key: 'insertMany',
      value: function insertMany(docs) {
        var _this = this;

        return new Promise(function (resolve, reject) {
          _this.mongooseModel.collection.insertMany(docs, {}, function (err, result) {
            if (err) {
              return reject(err);
            }

            resolve(result.ops);
          });
        });
      }
    }, {
      key: 'removeWhere',
      value: function removeWhere(query) {
        return this.mongooseModel.remove(query);
      }
    }, {
      key: 'remove',
      value: function remove(doc) {
        return this.mongooseModel.findById(doc._id).exec().then(function (foundDoc) {
          if (!foundDoc) {
            return Promise.resolve();
          }

          return foundDoc.remove();
        });
      }
    }, {
      key: 'update',
      value: function update(doc) {
        return this.mongooseModel.findById(doc._id).exec().then(function (foundDoc) {
          if (!foundDoc) {
            throw new Error('trying to update doc that does not exist id:' + doc._id);
          }

          if (_.isFunction(doc.toObject)) {
            doc = doc.toObject();
          }
          foundDoc.merge(doc);
          return foundDoc.save();
        });
      }
    }, {
      key: 'updateMany',
      value: function updateMany(ids, update) {
        return this.mongooseModel.update({ _id: { $in: ids } }, update, { multi: true }).exec();
      }
    }]);

    return MongooseCollection;
  })(jeggy.Collection);

  exports.MongooseCollection = MongooseCollection;

  var populateDoc = function populateDoc(doc, fieldKey) {
    return new Promise(function (resolve, reject) {
      doc.populate(fieldKey, function (error) {
        if (error) {
          return reject(error);
        }

        resolve(doc);
      });
    });
  };

  var MongooseAdapter = (function (_jeggy$Adapter) {
    _inherits(MongooseAdapter, _jeggy$Adapter);

    function MongooseAdapter(mongooseConnection, opts) {
      _classCallCheck(this, MongooseAdapter);

      _get(Object.getPrototypeOf(MongooseAdapter.prototype), 'constructor', this).call(this);
      if (_.isString(mongooseConnection)) {
        mongooseConnection = mongooseMob.getConnection(mongooseConnection, opts);
      }

      mongooseConnection.base.plugin(merge);

      this.mongooseConnection = mongooseConnection;
      this.collections = {};
    }

    _createClass(MongooseAdapter, [{
      key: 'addCollection',
      value: function addCollection(name, schema) {
        var collection = undefined;
        if (name instanceof MongooseCollection) {
          collection = name;
          name = collection.name;
        } else {
          if (!_.isString(name) || _.isEmpty(name)) {
            throw new Error('must provide a name when adding a collection');
          }
          var mongooseModel = mongooseMob.getModel(this.mongooseConnection, name, schema);
          collection = new MongooseCollection(name, mongooseModel);
        }

        this.collections[name] = collection;
        return collection;
      }
    }, {
      key: 'getCollection',
      value: function getCollection(name) {
        if (!this.collections[name]) {
          throw new Error('unknown collection: ' + name);
        }
        return this.collections[name];
      }
    }, {
      key: 'getCollections',
      value: function getCollections() {
        return this.collections;
      }
    }, {
      key: 'populate',
      value: function populate(docs, fieldKey) {
        if (!docs) {
          throw new Error('tried to populate a null value');
        }

        if (!_.isArray(docs)) {
          docs = [docs];
        }

        var promises = _.map(docs, function (doc) {
          return populateDoc(doc, fieldKey);
        });

        return Promise.all(promises).then(function () {
          return docs;
        });
      }
    }]);

    return MongooseAdapter;
  })(jeggy.Adapter);

  exports.MongooseAdapter = MongooseAdapter;
});
//# sourceMappingURL=./jeggymongoose.js.map