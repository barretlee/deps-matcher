# Deps Matcher

Match JS file's all dependencies.

## Install

```shell
npm install deps-matcher;
```

## Usage

```js
const DepsMatcher = require('deps-matcher');

const matches = new DepsMatcher([
  path.join(__dirname, '../lib/index.js'),
  path.join(__dirname, '../lib/index.css')
].filter(DepsMatcher.isJSFile));

console.log(JSON.stringify(matches, null, 2));
```

## Attention

- Promise the input are absolute path;

## Lisence

MIT Lisence.