const express = require('express')
const path = require('path')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const {User, Chat, Room} = require('./config/index').models

app.use(express.json())
app.use(express.urlencoded({extended: false}))

//heroku run printenv
//heroku run node
//console.log(process.env)
const port = process.env.PORT || 4000
let users = {}


if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, "frontend", "build")))
    app.get('*', (req,res)=>{
        res.sendFile(path.join(__dirname, "frontend", "build", "index.html"))
    })
    
}

    var cache = [];

        JSON.safeStringify = (obj, indent = 2) => {
            let cache = [];
            const retVal = JSON.stringify(
              obj,
              (key, value) =>
                typeof value === "object" && value !== null
                  ? cache.includes(value)
                    ? undefined // Duplicate reference found, discard key
                    : cache.push(value) && value // Store value in our collection
                  : value,
              indent
            );
            cache = null;
            return retVal;
          };
    
   

app.use((req,res,next)=>{
    if(req.originalUrl == '/favicon.ico')
    return res.status(204).json({nope:true})
    return next()
})

/*
Receives 2 users
looks up in the DB if the users have a room
create one if they don't have a room

Send 2 users, redirect to a new room if exists

@param {String} user1 - name of the first user
@param {String} user2 - name of the second user

*/

app.get('/room',async (req,res)=>{
    try{
        //check if room exists, redirect to room
        const {user1, user2} = await req.query
        let foundUser1 = await User.findOne({user:user1})
        let foundUser2 = await User.findOne({user:user2}) 
         //check if users exist
        if(!foundUser1 || !foundUser2) return res.status(400).json({success:false, message:"User not found"})
        
        let foundRoom = await Room.find({private:{user1: foundUser1._id, user2: foundUser2._id}}).populate('chatId')
        if(foundRoom.length == 0)
        {
            const newChat = await Chat.create({},{new:true})
            foundRoom = await Room.create(
                {
                    chatId: newChat._id, 
                    status:'Private', 
                    private:{user1: foundUser1._id, user2: foundUser2._id}
                })
        
        }

        //redirect to new room


        res.status(200).redirect('/room/'+ foundRoom._id)
    }
    catch(e){
        console.log(e)
    }

})

    app.get('/room/:roomId', (req,res)=>{
        const {roomId} = req.params
        //maybe make a function that 
        res.status(200).json({message:"In new room"})
    })

    /*
    *Runs sockets on the c._id given
    *@param c {ObjectId} Id given by mongoDB
    */
    let runSockets = c => {
            io.on('connect', socket =>{
                        /* 
                        * Socket runs when 'message' is received
                        * push message into DB and emit 'message' to client
                        *@param name {String} name of the user
                        *@param msg {String} message of the user
                        */
                       
                        socket.on('message', ({name,msg, room}) =>{
                            Chat.findByIdAndUpdate(
                                {_id:c._id}, 
                                {$push:{messages:{data:{message:msg, name:name}}}}, 
                                {new:true})
                            .then(chat=>{
                                io.in(room).emit('message', chat)
                            })
                            .catch(e=>console.log(e))
                            })

                        /* 
                        * Socket runs when 'new-user' is received
                        * Look for user in DB,
                        * if found emit an error
                        * else create the user in the DB and emit 'new-user'
                        *@param name {String} name of the user
                        */
                        socket.on('new-user', ({room, user})=>{
                            //implement password auth
                            socket.join(room)
                            User.findOne({user:user})
                            .then(u=>{
                                if(!u){
                                    users[socket.id] = user    
                                    User.create({user:user})
                                    Chat.findByIdAndUpdate(
                                        {_id:c._id}, 
                                        {$push:{messages:{data:{message:" has connected!", name:user}}}}, 
                                        {new:true})
                                    .then(chat=>{
                                        io.in(room).emit('message', chat)
                                        io.in(room).emit('users-logged-in', users)
                                    })
                                    .catch(e=>console.log(e))
                                    // io.emit('new-user', users[socket.id])
                                    console.log('new user')
                                    }
                                else
                                    io.to(socket.id).emit('error', 'User taken!')
                                })
                            })

                         /* 
                        * Socket runs when 'disconnect' is received
                        * emit 'disconnect'
                        */
                        socket.on('disconnect', (room)=>{
                            if(users[socket.id])
                            Chat.findByIdAndUpdate(
                                {_id:c._id}, 
                                {$push:{messages:{data:{message:" has disconnected!", name:users[socket.id]}}}}, 
                                {new:true})
                            .then(chat=>{
                                io.in(room).emit('message', chat)
                                console.log(users[socket.id] + ' disconnected')
                                delete users[socket.id]
                                io.in(room).emit('users-logged-in', users)
                                console.log('users-logged-in fired on disconnect')
                            })
                            .catch(e=>console.log(e))

                            })
                    })
                
    }

    //Create general room

    //Save id of chat on variable
    let c
    Room.findOne({status: "General"}).populate("chatId")
    .then(room => {

        //if room id isn't found
        //create a new room
        if(!room)
        {
            Chat.create({messages:[]})
            .then(ch=> {
                Room.create({chatId:ch._id, status:"General"})
                c = ch._id
                runSockets(c)
            })
        }
        //if room is found
        //execute code here
        else {
                c = room.chatId._id
                runSockets(c)
        }
    })

http.listen(port)