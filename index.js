const express = require('express')
const path = require('path')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const {User, Chat} = require('./config/index').models

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
                        socket.on('message', ({name,msg}) =>{
                            Chat.findByIdAndUpdate(
                                {_id:c._id}, 
                                {$push:{messages:{data:{message:msg, name:name}}}}, 
                                {new:true})
                            .then(chat=>{
                                io.emit('message', chat)
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
                        socket.on('new-user', (name)=>{
                            //implement password auth
                            User.findOne({user:name})
                            .then(u=>{
                                if(!u){
                                    users[socket.id] = name    
                                    User.create({user:name, chat:c._id})
                                    Chat.findByIdAndUpdate(
                                        {_id:c._id}, 
                                        {$push:{messages:{data:{message:" has connected!", name:name}}}}, 
                                        {new:true})
                                    .then(chat=>{
                                        io.emit('message', chat)
                                    })
                                    .catch(e=>console.log(e))
                                    // io.emit('new-user', users[socket.id])
                                    console.log('new user')
                                    }
                                else
                                    io.emit('error', 'User taken!')
                                })
                            })

                         /* 
                        * Socket runs when 'disconnect' is received
                        * emit 'disconnect'
                        */
                        socket.on('disconnect', ()=>{
                            if(users[socket.id])
                            Chat.findByIdAndUpdate(
                                {_id:c._id}, 
                                {$push:{messages:{data:{message:" has disconnected!", name:users[socket.id]}}}}, 
                                {new:true})
                            .then(chat=>{
                                io.emit('message', chat)
                            })
                            .catch(e=>console.log(e))
                            // io.emit('disconnect', (users[socket.id]))
                            delete users[socket.id]
                            })
                    })
                
    }
    //Save id of chat on variable
    let c
    Chat.findOne({})
    .then(chat => {

        //if chat id isn't found
        //create a new chat
        if(!chat)
        {
            Chat.create({messages:[]})
            .then(ch=> {
                c = ch._id
                
                runSockets(c)
            })
        }
        //if chat is found
        //execute code here
        else {
                c = chat._id

                runSockets(c)
        }
    })

http.listen(port)