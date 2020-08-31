module.exports = (connection, mongoose) => connection.model('Chat', 
new mongoose.Schema({
    messages:[String]
}))