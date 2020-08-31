const {connection, mongoose} = require('./database')
require('./models/chat')(connection,mongoose)
require('./models/users')(connection,mongoose)
module.exports = connection