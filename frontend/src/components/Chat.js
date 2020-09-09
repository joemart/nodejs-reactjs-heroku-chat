import React, {useState, useEffect, useRef} from 'react';
import io from 'socket.io-client'

export default({user})=>{

    const [chat, setChat] = useState([])
    const [data, setData] = useState({name: user, msg:'' })
    const [usersLogged, setUsersLogged] = useState({})
    const socketRef = useRef()
    const [socketURL] = useState(()=>((process.env.NODE_ENV === "production") ? "/": 'http://localhost:4000'))
    const [room, setRoom] = useState('General')

    let refreshPage = ()=>{
        window.location.reload(false)
    }

    useEffect(()=>{

        socketRef.current = io.connect(socketURL)
        socketRef.current.emit('new-user', {user, room})
        socketRef.current.on('error', ()=>refreshPage())
        socketRef.current.on('message', ({messages})=>{
        setChat(messages)
        })
        socketRef.current.on('users-logged-in', (users)=> setUsersLogged({...users}))
        return () => {
            socketRef.current.emit('disconnect', room)
            socketRef.current.off()
        }
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
        socketRef.current.emit('message', {name, msg, room})
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

    const returnSocket = (socket)=>{
        console.log(socket)
    }

    return <>
    
    <div>

        
        {/* Need to select the 'this' hook to add it to the parameters */}
        {Object.keys(usersLogged).map((u,i)=>{
            // console.log(usersLogged)
            if(u !== socketRef.current.id)
            return <a 
            key={i} 
            href={`${socketURL}/room?user1=${usersLogged[u]}&user2=${usersLogged[socketRef.current.id]}`}>{usersLogged[u]}
            {/* instead of going to localhost:4000, go to another frontend route, send the user1 and user2 and emit a join command,
            on join, check user1 and user2 if in DB,
            https://www.youtube.com/watch?v=ZwFA3YMfkoc
            */}
            </a>
        })}
      
        
        <button onClick={()=>returnSocket(socketRef.current)}>Return socket</button>

    </div>
        
        {chatForm()}
        {renderChat()}
     </>
}

