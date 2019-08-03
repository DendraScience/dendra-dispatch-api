"use strict";

const {
  configTimerSeconds
} = require('../../lib/utils');

const TASK_NAME = 'grooming';

module.exports = function (app) {
  const {
    logger
  } = app;
  const databases = app.get('databases');
  const tasks = app.get('tasks') || {};
  const config = tasks[TASK_NAME];
  if (!(config && databases)) return;
  const docLimit = typeof config.docLimit === 'number' ? config.docLimit : 20;
  const services = Array.isArray(config.services) ? config.services : [];

  const handleError = err => {
    logger.error(err);
  };

  const processService = async (service, now) => {
    const query = {
      expires_at: {
        $lte: now
      },
      $limit: docLimit,
      $sort: {
        expires_at: 1,
        // ASC
        _id: 1 // ASC

      }
    };
    const res = await service.find({
      query
    });

    if (!(res && res.data && res.data.length > 0)) {
      logger.info(`Task [${TASK_NAME}]: No data found`);
      return;
    }

    for (const item of res.data) {
      logger.info(`Task [${TASK_NAME}]: Removing ${item._id}`);
      await service.remove(item._id);
    }
  };

  const runTask = async () => {
    logger.info(`Task [${TASK_NAME}]: Running...`);

    for (const service of services) {
      await processService(app.service(service), new Date());
    } // NOTE: Add additional grooming steps here

  };

  const scheduleTask = () => {
    const timerSeconds = configTimerSeconds(config);
    logger.info(`Task [${TASK_NAME}]: Starting in ${timerSeconds} seconds`);
    config.tid = setTimeout(() => {
      runTask().catch(handleError).then(scheduleTask);
    }, timerSeconds * 1000);
  };

  scheduleTask();
};