module.exports = (connection, mongoose) => connection.model('Room', 
new mongoose.Schema({
    chatId:{type:mongoose.Schema.Types.ObjectId, ref:'Chat'},
    status:{type:String, enum:['General', 'Private']},
    user: {type:this.status == 'Private'? {type:mongoose.Schema.Types.ObjectId, max:2, min:2, ref:'User'} : []},
    // user: {type:String, sdfsdf:function(){if(this.status == 'General') return 'General'}},
    created:{type:Date, default:Date.now}
}))