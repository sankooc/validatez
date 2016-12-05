const should = require('should');
const _validator = require('../index');

describe('content test', () => {
  let validator;
  before(() => {
    const schema = {
      name: {
        errMessage: (type, val) =>
          `${type}-${val}`
        ,
      },
      nickname: {
        allowNil: true,
      },
      isChecked: {
        allowNil: true,
        type: Boolean,
        errMessage: (type, val) =>
          `${type}-${val}`,
      },
      age: {
        type: Number,
        range: [1, 10],
        errMessage: (type, val) =>
          `${type}-${val}`,
        allowNil: true,
      },
      nums: {
        type: [Number],
        range: [1, 10],
        errMessage: type =>
          `${type}`,
        allowNil: true,
      },
    };
    validator = _validator.create(schema);
  });
  it('story', () => {
    let data = {
      name: 'atom',
      isChecked: false,
    };
    should(validator.bind(validator, data)).not.throw();
    data = {};
    should(validator.bind(validator, data)).throw('nil-undefined');
    data = {
      name: 'atom',
      isChecked: 'aha',
    };
    should(validator.bind(validator, data)).throw('type error-aha');
    data = {
      name: 'atom',
      age: 2,
    };
    should(validator.bind(validator, data)).not.throw();
    data = {
      name: 'atom',
      age: 20,
    };
    should(validator.bind(validator, data)).throw('number range error-20');
    data = {
      name: 'atom',
      nums: ['cs'],
    };
    should(validator.bind(validator, data)).throw('type error');
    data = {
      name: 'atom',
      nums: [30, 2],
    };
    should(validator.bind(validator, data)).throw('number range error');
    data = {
      name: 'atom',
      nums: [9, 8],
    };
    should(validator.bind(validator, data)).not.throw();
  });
});

describe('field test', () => {
  it('case story', () => {
    const schema = {
      userName: {
        allowNil: false,
        errMessage: (type, val) =>
          `${type}-${val}`
        ,
      },
    };
    let option = {
      field: 'snake',
    };
    let validator = _validator.create(schema, option);
    let data = {
      user_name: 'atom',
    };
    should(validator.bind(validator, data)).not.throw();
    data = {
      userName: 'atom',
    };
    should(validator.bind(validator, data)).throw('nil-undefined');
    // KEBAB
    option = {
      field: 'kebab',
    };
    validator = _validator.create(schema, option);
    data = {
      'user-name': 'atom',
    };
    should(validator.bind(validator, data)).not.throw();
    data = {
      userName: 'atom',
    };
    should(validator.bind(validator, data)).throw('nil-undefined');
    // CAMEL
    option = {
      field: 'camel',
    };
    validator = _validator.create({
      user_name: {
        allowNil: false,
        errMessage: (type, val) =>
          `${type}-${val}`
        ,
      },
    }, option);
    data = {
      userName: 'atom',
    };
    should(validator.bind(validator, data)).not.throw();
  });
});
