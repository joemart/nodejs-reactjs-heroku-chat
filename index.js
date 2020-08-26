const express = require('express')
const app = express()
const path = require('path')
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const port = process.env.PORT || 4000
let users = {}

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, "frontend", "build")))
    app.get('*', (req,res)=>{
        res.sendFile(path.join(__dirname, "frontend", "build", "index.html"))
    })
    
}

io.on('connect', socket =>{
    socket.on('message', ({name,msg}) =>{
        io.emit('message', {name,msg})
    })
    
    socket.on('new-user', (name)=>{
        users[socket.id] = name
        io.emit('new-user', users[socket.id])
    })

    socket.on('disconnect', ()=>{
        if(users[socket.id])
        console.log(users[socket.id] +' dc!')
        delete users[socket.id]
    })
})


http.listen(port)