const should = require('should');
const _validator = require('../index');

describe('test', () => {
  let validator;
  before(() => {
    const schema = {
      name: {
        errMessage: (type, val) =>
          `${type}-${val}`
        ,
      },
      nickname: {
        required: false,
      },
      isChecked: {
        required: false,
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
        required: false,
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
        required: true,
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
        required: false,
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

describe('refer test', () => {
  it('story', () => {
    let schema = {
      prod: {
        type: '&serial'
      },
      akk: {
        type: '&age'
      },
      serial: {
        type: '&age'
      },
      age: {
        type: Number
      },
      name: {
        type: String
      }
    };
    should(_validator.create.bind(_validator, schema)).not.throw();
    schema = {
      age: {
        type: Number
      },
      name: {
        type: '&cd'
      }
    }
    should(_validator.create.bind(_validator, schema)).throw('schema error in[name]');
  });
});

describe('buildin type test', () => {
  it('story', () => {
    let schema = {
      email: {
        type: '@nothas'
      },
    };
    should(_validator.create.bind(_validator, schema)).throw('NO SUCH BUILDIN TYPE [@nothas]');
    schema = {
      email: {
        type: '@email'
      },
    };
    should(_validator.create.bind(_validator, schema)).not.throw();
    let validator = _validator.create(schema);
    let data;
    data = {
      email: 'aka@gmail.com',
    };
    should(validator.bind(null, data)).not.throw();

    data = {
      email: 'akmail.com',
    };
    should(validator.bind(null, data)).throw('invalid email pattern in FIELD_[email]_VALUE_[akmail.com]');

    _validator.register({
      code: {
        type: String,
        pattern: /^\d{16}$/,
      }
    })
    schema = {
      zcode: {
        type: '@code'
      },
    };
    validator = _validator.create(schema);
    data = {
      zcode: '1234123412341234',
    };
    should(validator.bind(null, data)).not.throw();
    data = {
      zcode: '12341234123413214213214',
    };
    // validator(data)
    should(validator.bind(null, data)).throw('PARAM_ERROR_[pattern error]_FIELD_[zcode]_VALUE_[12341234123413214213214]');
  });
});


describe('simple type test', () => {
  it('story', () => {
    let schema = {
      email: '@email',
      name: String,
      num: Number,
      pets: [String],
      age: '&num',
    };
    let validator = _validator.create(schema);

    let data = {
      email: 'ccc',
      name: 'kk',
      num: 123,
      pets: ['tom','jerry'],
      age: 20,
    };
    should(validator.bind(null, data)).throw('invalid email pattern in FIELD_[email]_VALUE_[ccc]');

    data = {
      email: 'sankooc@163.com',
      name: 'kk',
      num: 123,
      pets: ['tom','jerry'],
      age: 20,
    };
    should(validator.bind(null, data)).not.throw();
  });
});
