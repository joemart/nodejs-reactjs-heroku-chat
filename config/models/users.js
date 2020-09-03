module.exports = (connection, mongoose)=> connection.model('User', 
new mongoose.Schema({
    user:String,
    chat:{type:mongoose.Schema.Types.ObjectId, ref:"Chat"}
}))