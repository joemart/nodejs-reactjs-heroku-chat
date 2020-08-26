const express = require('express')
const app = express()
const path = require('path')
const port = process.env.PORT || 5000
const http = require('http').createServer(app)
const io = require('socket.io').listen(http)


if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, "frontend", "build")))
    app.get('*', (req,res)=>{
        res.sendFile(path.join(__dirname, "frontend", "build", "index.html"))
    })
    
}


http.listen(port)