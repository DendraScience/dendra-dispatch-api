"use strict";

/**
 * Dispatch API app.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module server/app
 */
const compress = require('compression');

const cors = require('cors');

const helmet = require('helmet');

const feathers = require('@feathersjs/feathers');

const configuration = require('@feathersjs/configuration');

const express = require('@feathersjs/express');

const socketio = require('@feathersjs/socketio');

const databases = require('./databases');

const middleware = require('./middleware');

const services = require('./services');

const tasks = require('./tasks');

module.exports = async logger => {
  const app = express(feathers());
  app.logger = logger; // Configure

  app.configure(configuration());
  await databases(app); // Feathers setup

  app.use(cors());
  app.use(helmet());
  app.use(compress());
  app.use(express.json());
  app.use(express.urlencoded({
    extended: true
  }));
  app.configure(express.rest());
  app.configure(socketio());
  app.configure(middleware);
  app.configure(services);
  app.configure(tasks);
  app.use(express.notFound());
  app.use(express.errorHandler({
    logger
  }));
  return app;
};