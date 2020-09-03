import React, {useState, useEffect, useRef} from 'react';
import io from 'socket.io-client'

export default({user})=>{

    const [chat, setChat] = useState([])
    const [data, setData] = useState({name: user, msg:'' })
    const socketRef = useRef()
    const [socketURL] = useState(()=>((process.env.NODE_ENV === "production") ? "/": 'http://localhost:4000'))

    let refreshPage = ()=>{
        window.location.reload(false)
    }

    // useEffect(()=>{
        
    // },[user])

    useEffect(()=>{
        socketRef.current = io.connect(socketURL)
        socketRef.current.emit('new-user', user)

        socketRef.current.on('error', ()=>refreshPage())
        socketRef.current = io.connect(socketURL)
        socketRef.current.on('new-user', name =>{
            //displays the message by 'n' amount of users
            socketRef.current.emit('message', {name, msg:" has connected!"})
        })
        socketRef.current.on('disconnect', name =>{
            socketRef.current.emit('message', {name:name, msg:" has disconnected!"})
        })

        socketRef.current.on('message', ({messages})=>{
            setChat(messages)
        })

    
    },[])


    const renderChat = () =>{
        const userChat = (d,i) => (<div key={i}> {d.data.name} : {d.data.message} </div>)

        return  chat.map( (d, i) => {

        return userChat(d,i)
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

