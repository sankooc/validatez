const _ = require('lodash');
const _types = require('./types');

const DEFAUT_META = {
  errorType: Error,
  handle: 'error',
  field: 'strict', // camel, snake, kebab
};

const DEFAULT_SCHEMA = {
  type: String,
  required: true,
  errMessage: 'PARAM_ERROR_[<%= errtype %>]_FIELD_[<%= field %>]_VALUE_[<%= val %>]',
};

const wrapKey = function wrapKey(type, key) {
  switch (type) {
    case 'snake':
      return _.snakeCase(key);
    case 'camel':
      return _.camelCase(key);
    case 'kebab':
      return _.kebabCase(key);
    default:
      return key;
  }
};

const _tp = function(arr){
  const _arr = [];
  const rs = _.partition(arr, (o) => {
    return !o.__ref;
  });
  const _stack = rs[0];
  let _bucket = rs[1];
  while(true){
    if(_.isEmpty(_bucket)){
      Array.prototype.push.apply(_arr, _stack);
      break;
    }
    if(_.isEmpty(_stack)){
      const fields = _bucket.map((s) => { return s.field}).join(',');
      throw Error(`schema error in[${fields}]`);
    }
    const head = _stack.shift();
    const _rs = _.partition(_bucket, (o) => {
      return o.sc.type === `&${head.field}`;
    });
    _arr.push(head);
    _.each(_rs[0],(it) => {
      it.sc = _.extend({}, head.sc, _.omit(it.sc,'type'));
    });
    Array.prototype.push.apply(_stack, _rs[0]);
    _bucket = _rs[1]
  }
  return _arr;
}

const _isSam = (type) => {
  return typeof type === 'function' || _.isArray(type);
}

const _isSim = (type) => {
  return typeof type === 'string' && type.charAt(0) === '@'
}

const _isRef = (type) => {
  return typeof type === 'string' && type.charAt(0) === '&';
}

const normal = (field, schema) => {
  const type = schema.type;
  let sc = schema;
  const __ref = _isRef(type);
  if(_isSim(type)){
    const f = type.substring(1);
    const _type = _types[f];
    if(!_type){
      throw new Error(`NO SUCH BUILDIN TYPE [${type}]`);
    }
    sc = _.extend({}, _type ,_.omit(schema, 'type'));
  }
  return {field, sc, __ref}
}

const _toArray = function(schema){
  const keys = Object.keys(schema);
  const parse = (field) => {
    let _schema = schema[field];
    if (_isSam(_schema) || _isSim(_schema) || _isRef(_schema) ) {
      _schema = {
        type: _schema
      }
      return normal(field, _schema);
    } else  if (typeof _schema === 'object') {
      return normal(field, _schema);
    }
    throw new Error('SCHEMA_ERROR');
  };

  const arr = keys.map(parse);
  return _tp(arr);
}


exports.create = function _create(schema, _option) {
  const option = _.extend({}, DEFAUT_META, _option);
  const oMap = {};
  const arr = _toArray(schema);
  _.each(arr, (s) => {
    const _sc = s.sc;
    const k = s.field;
    const scm = _.extend({}, DEFAULT_SCHEMA, _sc);
    const { type, allowNil, required, pattern, range } = scm;
    let errMessage = scm.errMessage;
    if(!_.isFunction(errMessage)){
      const compiled = _.template(scm.errMessage);
      errMessage = (errtype, val) => compiled({errtype, val, field: k, schema: scm});
    }
    const _allowNil = !required || !!allowNil;
    if(allowNil !== undefined){
      console.warn('[validatez]: {allowNil} is deprecated, use {required} instead');
    }
    const occurErr = function _oc(errtype, val) {
      const msg = errMessage(errtype, val, k, scm);
      throw new Error(msg);
    };

    const _vali = (_type, val) => {
      switch (_type) {
        case String:
          if (_.isString(val)) {
            const sval = val.trim();
            if (pattern && !pattern.test(sval)) {
              occurErr('pattern error', val);
            }
          } else {
            occurErr('type error', val);
          }
          break;
        case Number:
          if (_.isNumber(val)) {
            if (range && range.length > 1) {
              if (!_.inRange(val, range[0], range[1])) {
                occurErr('number range error', val);
              }
            }
          } else {
            occurErr('type error', val);
          }
          break;
        case Boolean:
          if (!_.isBoolean(val)) {
            occurErr('type error', val);
          }
          break;
        case Date:
          if (!_.isDate(val)) {
            occurErr('type error', val);
          }
          // range
          break;
        case Object:
          if (!_.isObject(val)) {
            occurErr('type error', val);
          }
          break;
        default:
          occurErr('type error', val);
      }
    };
    const func = (val) => {
      if (_.isNil(val)) {
        if (!_allowNil) {
          occurErr('nil', val);
        }
      } else {
        switch (type) {
          case Array:
            if (_.isArray(val)) {
            } else {
              occurErr('type error', val);
            }
            break;
          default:
            if (_.isArray(type) && _.isArray(val) && type.length === 1) {
              if (_.isArray(val)) {
                for (const v of val) {
                  _vali(type[0], v);
                }
              } else {
                occurErr('array type error', val);
              }
            } else {
              _vali(type, val);
            }
        }
      }
    };
    oMap[k] = func;
  })
  const fn = function _c(data) {
    if (schema && !_.isEmpty(schema)) {
      _.each(oMap, (fn, k) => {
        fn(data[wrapKey(option.field, k)]);
      });
    }
  };
  const eType = option.errorType || option.handle;
  if(eType === 'function' || eType === 'callback' || eType === Function){
    if(eType === Function){
      console.warn('[validatez]: errorhandle {Function} is deprecated, use {`callback`} instead');
    }
    return function(data,callback){
      let msg;
      try{
        fn(data);
      } catch(e){
        msg = e.message;
      }
      callback(msg, data);
    }
  }
  if(eType === 'promise' || eType === Promise){
    if(eType === Promise){
      console.warn('[validatez]: errorhandle {Promise} is deprecated, use {`promise`} instead');
    }
    return function(data){
      return new Promise((resolve, reject) => {
        try{
          fn(data);
          resolve(data);
        } catch(e){
          reject(e.message);
        }
      });
    }
  }
  return fn;
};

exports.register = function _register(schema){
  _.extend(_types, schema);
}
