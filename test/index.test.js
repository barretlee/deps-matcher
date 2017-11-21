const path = require('path');
const DepsMatcher = require('../lib/index');

const matches = new DepsMatcher([
  path.join(__dirname, '../lib/index.js'),
  path.join(__dirname, '../lib/index.css')
].filter(DepsMatcher.isJSFile));

console.log(JSON.stringify(matches, null, 2));