const _ = require('lodash');

const DEFAUT_META = {
  errorType: Error,
  field: 'strict', // camel, snake
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

exports.create = function _create(schema, _option) {
  const option = _.extend({}, DEFAUT_META, _option);
  const oMap = {};
  _.map(schema, (_sc, k) => {
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
          if (!_.Date(val)) {
            occurErr('type error', val);
          }
          // range
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
  });
  return function _c(data) {
    if (schema && !_.isEmpty(schema)) {
      _.each(oMap, (fn, k) => {
        fn(data[wrapKey(option.field, k)]);
      });
    }
  };
};
