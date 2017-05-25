module.exports = {
  email: {
    type: String,
    pattern: /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,
    errMessage: 'invalid email pattern in FIELD_[<%= field %>]_VALUE_[<%= val %>]',
  },
  url: {
    type: String,
    pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    errMessage: 'invalid URL pattern in FIELD_[<%= field %>]_VALUE_[<%= val %>]',
  },
  ip: {
    type: String,
    pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    desc: 'ip address',
  },
  pwd:{
    type: String,
    pattern: /^[\x21-\x7e]{5,}$/,
    errMessage: 'AT_LEAST_5_CHAR_WITH_NUM_ALPHABET_SYMBOLS in FIELD_[<%= field %>]_VALUE_[<%= val %>]',
    desc: 'common password',
  },
  spwd: {
    type: String,
    pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
    desc: 'at least 8 chars with upper case and lower case and number and symbols',
  },
  integer: {
    type: String,
    pattern: /^\d*$/,
  },
  float: {
    type: String,
    pattern: /^-?([1-9]\d*.\d*|0.\d*[1-9]\d*|0?.0+|0)$/,
  },
  NES: {
    type: String,
    pattern: /\S+/,
    desc: 'not a empty string',
  },
  currency: {
    type: String,
    pattern: /^([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(.[0-9][0-9])?$/,
  },
  dollar: {
    type: String,
    pattern: /^\$?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(.[0-9][0-9])?$/,
  },
  cny: {
    type: String,
    pattern: /^¥?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(.[0-9][0-9])?$/,
  },
  percent: {
    type: String,
    pattern: /^(100(?:\.0{1,2})? | 0*?\.\d{1,2} | \d{1,2}(?:\.\d{1,2})? )%$/,
  },
  zip_code_cn:{
    type: String,
    pattern: /^\d{6}$/,
    desc: 'chinese zip code pattern',
  },
  id_cn: {
    type: String,
    pattern: /^\d{15}|\d{18}$/,
    desc: 'chinese id pattern',
  },
  cn_char: {
    type: String,
    pattern: /^[\u4e00-\u9fa5]+$/,
    desc: 'chinese character',
  },
  mobile_cn: {
    type: String,
    pattern: /^1\d{10}$/,
    desc: 'chinese mobile phone pattern',
  },
  mid: {
    type: String,
    pattern: /^[0-9a-f]{24}$/,
    desc: 'mongodb _id',
  },
}
