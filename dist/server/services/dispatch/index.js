"use strict";

const service = require('feathers-mongodb');

const hooks = require('./hooks');

module.exports = function (app) {
  const databases = app.get('databases');
  const services = app.get('services');
  if (!(databases.mongodb && databases.mongodb.dispatch && services.dispatch)) return;
  const {
    dispatch
  } = databases.mongodb;
  const {
    db
  } = dispatch;
  const {
    models
  } = services.dispatch;
  models.forEach(model => {
    const mongoService = service({
      Model: db.collection(model.collection),
      paginate: dispatch.paginate,
      whitelist: dispatch.whitelist
    });
    app.use(`/${model.name}`, mongoService); // Get the wrapped service object, bind hooks

    app.service(model.name).hooks(hooks);
  });
};