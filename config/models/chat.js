module.exports = (connection, mongoose) => connection.model('Chat', 
new mongoose.Schema({
    messages:[{ 
        data:{message:String, name:String}, 
        created: {type:Date, default:Date.now},
        default:[]
    }]
}))