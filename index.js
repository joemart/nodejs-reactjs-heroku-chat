const express = require('express')
const app = express()
const path = require('path')
const port = 5000
const io = require('socket.io')


if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, "frontend", "build")))
    app.get('*', (req,res)=>{
        res.sendFile(path.join(__dirname, "frontend", "build", "index.html"))
    })
    
}


app.listen(process.env.PORT || port)