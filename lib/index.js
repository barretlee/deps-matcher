'use strict';

const fs = require('fs');
const path = require('path');
const debug = require('debug');
const assert = require('assert');
const matchRequire = require('match-require');

const depsMatcherDebug = debug('deps-matcher');

/**
 * 文件依赖分析组件
 * 
 * @class DepsMatcher
 */
class DepsMatcher {

  static isJSFile(file) {
    return path.extname(file) === '.js';
  }

  /**
   * 分析文件的依赖
   * 
   * @param {any} files - 接受一个数据，所有文件必须是绝对路径
   * 
   * @memberof DepsMatcher
   */
  constructor(files) {
    this.deps = {};
    if (typeof files === 'string') {
      this.matchFile(files);
    } else if (typeof files === 'object' && files.length > 0) {
      this.matchAllFile(files);
    }
    this.unique();
  }

  /**
   * 分析单个文件依赖
   * 
   * @param {String} filePath - 文件路径，要求为绝对路径
   * 
   * @memberof DepsMatcher
   */
  matchFile(filePath) {

    // 防止循环依赖
    if (this.deps[filePath]) return;

    assert(path.isAbsolute(filePath), `Expect \`${filePath}\` be an absolute path.`);
    assert(fs.existsSync(filePath), `File \`${filePath}\` Not Exists`);

    if (!/\.(jsx?|css)$/.test(filePath)) {
      if (/\/$/.test(filePath)) {
        filePath += 'index.js';
      } else {
        filePath += '/index.js';
      }
    }

    const fileContent = fs.readFileSync(filePath).toString();
    const deps = matchRequire.findAll(fileContent);

    this.deps[filePath] = deps.filter((mod) => {
      return !matchRequire.isRelativeModule(mod);
    });

    const depsDeep = deps.filter((mod) => {
      return matchRequire.isRelativeModule(mod);
    }).map((file) => {
      file = path.join(path.dirname(filePath), file);
      if (!fs.existsSync(file) && fs.existsSync(`${file}.js`)) {
        file += '.js';
      }
      return file;
    });

    return this.matchAllFile(depsDeep);

  }

  /**
   * 分析多个文件依赖
   * 
   * @param {Array} files 
   * 
   * @memberof DepsMatcher
   */
  matchAllFile(files) {
    files.forEach((file) => {
      this.matchFile(file);
    });
  }

  /**
   * 注入 fs/http 等，这些为 Sercurity Holding Package
   * npm 做了处理，写入默认不会安装，所以不删除
   * 
   * @memberof DepsMatcher
   */
  unique() {
    let depsAll = [];

    depsMatcherDebug(this.deps);

    Object.keys(this.deps).forEach((key) => {
      depsAll = depsAll.concat(this.deps[key]);
    });
    const deps = {};
    for (let i = 0, len = depsAll.length; i < len; i++) {
      if (!deps[depsAll[i]]) {
        deps[depsAll[i]] = true;
      }
    }
    this.depsArr = Object.keys(deps);
    
    depsMatcherDebug(this.depsArr);
  }

}

module.exports = DepsMatcher;