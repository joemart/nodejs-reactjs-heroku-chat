require('dotenv').config()
const mongoose = require('mongoose')
const conn = process.env.MONGODB_URI
const options = {    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false}
const connection = mongoose.createConnection(conn, options)
.once('on', ()=> console.log('Connected to DB'))

module.exports = {connection, mongoose}