module.exports = async app => {
  const databases = app.get('databases')

  if (databases.mongodb) await require('./mongodb')(app)
}
