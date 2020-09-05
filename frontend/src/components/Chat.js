import React, {useState, useEffect, useRef} from 'react';
import io from 'socket.io-client'

export default({user})=>{

    const [chat, setChat] = useState([])
    const [data, setData] = useState({name: user, msg:'' })
    const [usersLogged, setUsersLogged] = useState({})
    const socketRef = useRef()
    const [socketURL] = useState(()=>((process.env.NODE_ENV === "production") ? "/": 'http://localhost:4000'))


    let refreshPage = ()=>{
        window.location.reload(false)
    }

    useEffect(()=>{
        socketRef.current = io.connect(socketURL)
        socketRef.current.emit('new-user', user)
        socketRef.current.on('error', ()=>refreshPage())
        socketRef.current.on('message', ({messages})=>{
        setChat(messages)
        })
        socketRef.current.on('users-logged-in', (users)=> setUsersLogged({...users}))
    },[setChat,setData,setUsersLogged,socketURL])


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
    
    <div>
        {Object.values(usersLogged).map(u=>{
        return <a href={`${socketURL}/1234`}>{u}</a>
        })}
    </div>
        
        {chatForm()}
        {renderChat()}
     </>
}

