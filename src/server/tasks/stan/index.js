const STAN = require('node-nats-streaming')
const { configTimerSeconds } = require('../../lib/utils')

const TASK_NAME = 'stan'

module.exports = function(app) {
  const { logger } = app
  const clients = app.get('clients')
  const tasks = app.get('tasks') || {}

  const config = tasks[TASK_NAME]

  if (!(config && clients && clients.stan)) return

  const { stan } = clients

  const handleError = err => {
    logger.error(err)
  }

  const runTask = async () => {
    logger.info(`Task [${TASK_NAME}]: Running...`)

    if (stan.isConnected) return
    if (stan.instance) stan.instance.removeAllListeners()

    logger.info(`Task [${TASK_NAME}]: NATS Streaming connecting`)

    stan.instance = STAN.connect(stan.cluster, stan.client, stan.opts || {})
    stan.instance.once('close', () => {
      stan.isConnected = false
      logger.info('NATS Streaming closed')
    })
    stan.instance.once('connect', () => {
      stan.isConnected = true
      logger.info('NATS Streaming connected')
    })
    stan.instance.on('error', err => {
      logger.error('NATS Streaming error', err)
    })
  }

  const scheduleTask = () => {
    const timerSeconds = configTimerSeconds(config)

    logger.info(`Task [${TASK_NAME}]: Starting in ${timerSeconds} seconds`)

    config.tid = setTimeout(() => {
      runTask()
        .catch(handleError)
        .then(scheduleTask)
    }, timerSeconds * 1000)
  }

  scheduleTask()
}
