module.exports = (connection, mongoose)=> connection.model('User', 
new mongoose.Schema({
    user:String,
    rooms:[{type:mongoose.Schema.Types.ObjectId, ref:"Room"}]
}))