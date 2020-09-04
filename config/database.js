require('dotenv').config()
const mongoose = require('mongoose')
// const conn = process.env.MONGODB_URI
const conn = process.env.MONGODB_LOCAL

const options = {    
    useNewUrlParser: true, 
    useCreateIndex: true,
    useUnifiedTopology: true, 
    useFindAndModify: false}
const connection = mongoose.createConnection(conn, options)
.once('on', ()=> console.log('Connected to DB'))

module.exports = {connection, mongoose}