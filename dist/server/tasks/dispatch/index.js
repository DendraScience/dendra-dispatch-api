"use strict";

const moment = require('moment');

const {
  configTimerSeconds
} = require('../../lib/utils');

const MAX_TIME = Date.UTC(2200, 1, 2);
const TASK_NAME = 'dispatch';

module.exports = function (app) {
  const {
    logger
  } = app;
  const clients = app.get('clients');
  const tasks = app.get('tasks') || {};
  const config = tasks[TASK_NAME];
  if (!(config && config.requestSubject && clients && clients.stan)) return;
  const services = Array.isArray(config.services) ? config.services : [];
  const {
    requestSubject
  } = config;
  const {
    stan
  } = clients;

  const handleError = err => {
    logger.error(err);
  };

  const processService = async (service, now) => {
    const query = {
      dispatch_at: {
        $lte: now
      },
      $or: [{
        expires_at: {
          $exists: false
        }
      }, {
        expires_at: {
          $gt: now
        }
      }],
      $sort: {
        dispatch_at: 1,
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
      logger.info(`Task [${TASK_NAME}]: Dispatching ${item._id}`);
      /*
        Prepare outbound message and publish.
       */

      const reqAt = moment();
      const dispatchInfo = item.dispatch_info = {
        request_subject: requestSubject,
        requested_at: reqAt.toDate()
      };
      const msgStr = JSON.stringify(item);
      await new Promise((resolve, reject) => {
        stan.instance.publish(requestSubject, msgStr, (err, guid) => err ? reject(err) : resolve(guid));
      });
      logger.info(`Task [${TASK_NAME}]: Published request to '${requestSubject}'`);
      /*
        Reschedule if needed, patch item.
       */

      const patchData = {
        dispatch_at: new Date(MAX_TIME),
        dispatch_info: dispatchInfo
      };

      if (typeof item.dispatch_every === 'string') {
        try {
          patchData.dispatch_at = reqAt.add(...item.dispatch_every.split('_')).toDate();
          logger.info(`Task [${TASK_NAME}]: Rescheduling at '${patchData.dispatch_at}'`);
        } catch (err) {
          logger.error(`Task [${TASK_NAME}]: Rescheduling error: ${err.message}`);
        }
      }

      logger.info(`Task [${TASK_NAME}]: Patching ${item._id}`);
      await service.patch(item._id, patchData);
    }
  };

  const runTask = async () => {
    logger.info(`Task [${TASK_NAME}]: Running...`);

    if (!stan.isConnected) {
      logger.info(`Task [${TASK_NAME}]: NATS Streaming not connected`);
      return;
    }

    for (const service of services) {
      await processService(app.service(service), new Date());
    } // NOTE: Add additional dispatch steps here

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