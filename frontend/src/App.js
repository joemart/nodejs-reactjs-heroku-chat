import React, {useState} from 'react';
import Join from './components/Join'
import Chat from './components/Chat'



export default () =>{

  

  const [user,setUser] = useState(null)

        return  !user ? (<Join login = {u => {setUser(u)}} ></Join>) 
        : (<Chat user={user}></Chat>)
        // return (<>
        // HELLO
        // </>)
}

