# validatez

[![NPM](https://nodei.co/npm/validatez.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/validatez/)

![travis](https://travis-ci.org/sankooc/validatez.svg?branch=master)
![dm](https://img.shields.io/npm/dm/validatez.svg)
![version](https://img.shields.io/npm/v/validatez.svg)

simple way to validate object

## install

`$ npm install validatez`

## base usage

```
const creator = require('validatez');

const schema = {
  name: {
    type: String,
    errMessage: (type, val) =>
      `error occur ${type}-${val}`
    ,
  },
  age: {
    type: Number,
    range: [1, 100],
    errMessage: 'age incorrect',
    required: false,
  },
};

const validator = creator.create(schema);

let data = {
  name: 'atom',
}
validator(data); // pass

data = {
  name: 'atom',
  age: 200,
}
validator(data); // throw exception

```


## type refer

```
const schema = {
  address: {
    type: String,
    pattern: /^\w{10}$/,
  },
  address2: {
    type: '&address', // & + field to refer existed schema
  },
};

const validator = validate.create(schema);

let data = {
  address: 'china beijing bejing',
  address2: 'bejing chaoyangqu chaoyangbeilu',
}
validator(data); // pass

```

## buildin types

all buildin type start with `@`

```

const schema = {
  email: {
    type: '@email',
  },
};
const validator = validate.create(schema);

let data = {
  email: 'sankooc@scd.com',
}
validator(data); // pass

```

 all buildin types [HERE](doc/types.md)

 if you need more buildin types, create [ISSUE](https://github.com/sankooc/validatez/issues/new)

 also you can define or override buildin type

 ```
 validate.register({
   code: {
     type: String,
     pattern: /^\d{16}$/,
   }
 })

 const schema = {
   zcode: {
     type: '@code'
   },
 };
 validator = validate.create(schema);

 data = {
   zcode: '1234123412341234',
 };

 validator(data); //pass

 ```

## simple define

```

const schema = {
  email: '@email',
  name: String,
};
const validator = validate.create(schema);

let data = {
  email: 'sankooc@scd.com',
  name: 'sankooc',
}
validator(data); // pass


```



## simple inject for control flow

### if your code managed by `Promise` your code will be like below

```

function process(data){
  // next
}
getSomeData().then(process)

```

### add data validation

```

const schema = {
  address: {
    type: String,
  },
};

const option = {
  errorType: Promise,
}
const validator = validate.create(schema, option);

getSomeData().then(validator).then(process)

```


### if your code managed by `async` your code will be like below


```

function process(data, callback){
  // next
}
async.waterfall([getSomeData, process],callback);

```

### add data validation

```

const schema = {
  address: {
    type: String,
  },
};

const option = {
  errorType: Function,
}
const validator = validate.create(schema, option);

async.waterfall([getSomeData, validator, process],callback);

```


## support string case

```

const schema = {
  userName: {
    type: String,
  },
};
const option = {
  field: 'snake' // snake, camel, kebab
}
const validator = validate.create(schema, option);

let data = {
  user_name: 'atom',
}
validator(data); // pass

```

## schema option

| key       | type          |default value| desc                         |   
|-----------|---------------|-------------|------------------------------|
| type      |string/function|String       |                              |
| required  |boolean        |false        |                              |
| errMessage|string/function|`error param`| error message                |
| range     |array          |             | enable when type is `Number` |
| pattern   |regex          |             | enable when type is `String` |



## valiate option

| key     |type    |default value | desc             |
|---------|--------|--------|------------------------|
|handle   |string  |`error` | 'error'/'promise'/'callback' |
|field    |string  |`strict`| snake/camel/kebab      |
