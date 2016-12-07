const fs = require('fs');
const buildin = require('../types');
const _ = require('lodash');

let content = '## buildin types \r\n \r\n';
content += '| type | desc | \r\n';
content += '|------|------| \r\n';

_.each(buildin, (v, k) => {
  const desc = v.desc || k;
  const key = `@${k}`;
  content += `| ${key} | ${desc} | \r\n`;
});

fs.writeFileSync(__dirname+'/../doc/types.md', content);
