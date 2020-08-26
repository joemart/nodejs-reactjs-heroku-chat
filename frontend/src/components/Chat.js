import React, {useState, useEffect, useRef} from 'react';
import io from 'socket.io-client'

export default({user})=>{

    const [chat, setChat] = useState([])
    const [data, setData] = useState({name: user, msg:'' })
    const socketRef = useRef()
    const [socketURL] = useState(()=>{if(process.env.NODE_ENV === "production")return "/"; else return 'http://localhost:4000'})


    useEffect(()=>{
        socketRef.current = io.connect(socketURL)
        socketRef.current.emit('new-user', user)
    },[user])

    useEffect(()=>{
        socketRef.current = io.connect(socketURL)

        socketRef.current.on('new-user', name =>{
            receivedMessages(name + " has connected!")
        })

        socketRef.current.on('message', ({name, msg})=>{
            receivedMessages({name, msg})
        })

        
    },[])

    const receivedMessages = (message) =>{
        setChat(oldchat=>[...oldchat, message])
    }

    const renderChat = () =>{

        const userChat = (data,i) => (<div key={i}> {data.name} : {data.msg} </div>)
        const user = (data,i) => (<div key={i}> {data } </div>)

        return  chat.map( (data, i) => {

        return typeof(data) == 'object' ? userChat(data,i) : user(data,i)
            })
    }

    const handleSubmitButton = (e) =>{
        e.preventDefault()
        const {name, msg} = data
        socketRef.current.emit('message', {name, msg})
        setData({...data, msg:''})
    }

    const chatForm = () =>{

        return   <div className="card">
            {console.log(chat)}
                <form onSubmit={handleSubmitButton}>
                    <h1>Messenger</h1>
                    <div className="name-field">
                        <textarea 
                        name="msg" 
                        cols="30" 
                        rows="10" 
                        id="outlined-multiline-static"
                        value = {data.msg} 
                        onChange={e=>setData({...data, [e.target.name]:e.target.value})}></textarea>
                    </div>
                    <input type="submit" value="Enter"/>
                </form>
            </div>
        }

    return <>
        {chatForm()}
        {renderChat()}
     </>
}

