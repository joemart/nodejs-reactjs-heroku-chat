const express = require('express')
const path = require('path')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const {User, Chat} = require('./config/index').models

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

app.use(express.urlencoded({extended: false}))

    Chat.create({messages:[]})
    .then(c=>{
        io.on('connect', socket =>{
            console.log('connected socket')
            socket.on('message', ({name,msg}) =>{
                console.log(name, msg)
                Chat.findByIdAndUpdate(
                    {_id:c._id}, 
                    {$push:{messages:{data:{message:msg, name:name}}}}, 
                    {new:true})
                .then(chat=>{
                    // console.log(chat)
                    io.emit('message', chat)
                })
                .catch(e=>console.log(e))
                // io.emit('message', {name,msg})
                })

                
            socket.on('new-user', (name)=>{
                //implement password auth
                User.findOne({user:name})
                .then(u=>{
                    if(!u){
                        users[socket.id] = name    
                        User.create({user:name, chat:c._id})
                        io.emit('new-user', users[socket.id])
                        console.log('new user')
                         }
                    else
                        io.emit('error', 'User taken!')
                      })
                })

            socket.on('disconnect', ()=>{
                if(users[socket.id])
                console.log(users[socket.id] +' dc!')
                // io.emit('message', ({name: users[socket.id]}))
                delete users[socket.id]
                })
        })
    })
    .catch(e=>console.log(e))




http.listen(port)