const _ = require('lodash');

const DEFAUT_META = {
  errorType: Error,
  field: 'strict', // camel, snake, kebab
};

const DEFAULT_SCHEMA = {
  type: String,
  allowNil: false,
  errMessage: 'error param',
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

const _toArray = function(schema){
  const keys = Object.keys(schema);
  const arr = keys.map((field) => {
    const type = schema[field].type;
    const __ref = (typeof type === 'string' && type.charAt(0) === '&');
    return {field, sc: schema[field], __ref}
  });
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
    const { type, errMessage, allowNil, pattern, range } = scm;
    const occurErr = function _oc(errtype, val) {
      const msg = _.isFunction(errMessage) ? errMessage(errtype, val) : errMessage;
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
        if (!allowNil) {
          occurErr('nil', val);
        }
      } else {
        switch (type) {
          case Array:
            if (_.isArray(val)) {
              // range
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
                occurErr('type error', val);
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
  if(option.errorType === Function){
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
  if(option.errorType === Promise){
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
