import React, {useState} from 'react';
import "./Join.css"


export default ({login}) =>{

    
    const [name, setName] = useState('')

    const onSubmitButton = e =>{
        e.preventDefault()
        login(name)
    }

    return <>
    <form className="OuterContainer" onSubmit={onSubmitButton}>
        <div className="InnerContainer">
            <div className="heading">Join us</div>
            <div><input type="text" placeholder = "name" 
            onChange={e=> setName(e.target.value)}/></div>
            <input type="submit" value="Sign in"/>
        </div>
    </form>
    </>

}