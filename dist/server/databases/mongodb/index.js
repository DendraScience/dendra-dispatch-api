"use strict";

const Logger = require('mongodb').Logger;

module.exports = async app => {
  const mongodb = app.get('databases').mongodb;

  if (mongodb.defaultLogger) {
    // Configure logging
    const defaultLogger = mongodb.defaultLogger;
    if (defaultLogger.level) Logger.setLevel(defaultLogger.level); // Set our own logger
    // SEE: http://mongodb.github.io/node-mongodb-native/2.0/tutorials/logging/

    Logger.setCurrentLogger((message, context) => {
      app.logger.log({
        level: context.type,
        message
      });
    });
  }

  if (mongodb.dispatch) await require('./dispatch')(app);
};