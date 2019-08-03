const MongoClient = require('mongodb').MongoClient

module.exports = async app => {
  const { dispatch } = app.get('databases').mongodb

  // Configure a new instance
  let retries = 100
  while (true) {
    try {
      dispatch.client = await MongoClient.connect(
        dispatch.url,
        dispatch.options
      )
      dispatch.db = dispatch.client.db(dispatch.dbName)
      break
    } catch (err) {
      app.logger.error(err)
    }

    if (retries-- === 0)
      throw new Error('MongoDB connection retry attempts exceeded')

    await new Promise(resolve => setTimeout(resolve, 5000))
  }
}
