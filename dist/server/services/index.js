"use strict";

const path = require('path');

module.exports = function (app) {
  const names = ['dispatch'];
  names.forEach(name => app.configure(require(path.join(__dirname, name))));
};