module.exports = (connection, mongoose) => connection.model('Room', 
new mongoose.Schema({
    chatId:{type:mongoose.Schema.Types.ObjectId, ref:'Chat'},
    status:{type:String, enum:['General', 'Private']},
    private: {
        user1:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
        user2:{type:mongoose.Schema.Types.ObjectId, ref:'User'}
        },
    general:[],
    created:{type:Date, default:Date.now}
}))