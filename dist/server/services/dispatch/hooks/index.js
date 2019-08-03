"use strict";

const apiHooks = require('@dendra-science/api-hooks-common');

const {
  disallow
} = require('feathers-hooks-common');

exports.before = {
  // all: [],
  find: apiHooks.coerceQuery(),
  // get: [],
  create: [apiHooks.timestamp(), apiHooks.coerce()],
  update: disallow(),
  patch: [apiHooks.timestamp(), apiHooks.coerceQuery(), apiHooks.coerce()],
  remove: apiHooks.coerceQuery()
};
exports.after = {// all: [],
  // find: [],
  // get: [],
  // create: [],
  // update: [],
  // patch: [],
  // remove: []
};