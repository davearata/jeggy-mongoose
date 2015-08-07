var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jeggy'), require('lodash'), require('mongoose-mob')) : typeof define === 'function' && define.amd ? define(['exports', 'jeggy', 'lodash', 'mongoose-mob'], factory) : factory(global.jeggymongoose = {}, global.jeggy, global._, global.mongooseMob);
})(this, function (exports, jeggy, _, mongooseMob) {
  'use strict';

  _ = 'default' in _ ? _['default'] : _;
  mongooseMob = 'default' in mongooseMob ? mongooseMob['default'] : mongooseMob;

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
      value: function find(query, projection) {
        return this.mongooseModel.find(query, projection).exec();
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
      key: 'removeWhere',
      value: function removeWhere(query) {
        return this.mongooseModel.remove(query);
      }
    }, {
      key: 'remove',
      value: function remove(doc) {
        return this.mongooseModel.findById(doc._id).exec().then(function (foundDoc) {
          if (!foundDoc) {
            throw new Error('trying to remove doc that does not exist id:' + doc._id);
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

          doc = _.omit(doc, '_id');
          doc = _.omit(doc, '__v');
          foundDoc = _.assign(foundDoc.toObject(), doc);
          _.forEach(_.keys(doc), function (key) {
            if (!_.isNull && (_.isObject(doc[key]) || _.isArray(doc[key]))) {
              foundDoc.markModified(key);
            }
          });
          return foundDoc.save();
        });
      }
    }]);

    return MongooseCollection;
  })(jeggy.Collection);

  exports.MongooseCollection = MongooseCollection;

  var _MongooseAdapter__populateDoc = function populateDoc(doc, fieldKey) {
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

    function MongooseAdapter(mongooseConnection) {
      _classCallCheck(this, MongooseAdapter);

      _get(Object.getPrototypeOf(MongooseAdapter.prototype), 'constructor', this).call(this);
      if (_.isString(mongooseConnection)) {
        mongooseConnection = mongooseMob.getConnection(mongooseConnection);
      }

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
          return _MongooseAdapter__populateDoc(doc, fieldKey);
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