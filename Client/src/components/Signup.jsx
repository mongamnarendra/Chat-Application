import { useState } from "react"
import axios from "axios"
const Signup =()=>{
    const [user,setUser] = useState({
        name:"",
        email:"",
        password:""
    })

    const handleChange = (e) =>{
        setUser({
            ...user,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) =>{
        e.preventDefault();
        const res = await axios.post("http://localhost:3000/api/v1/auth/signup",user);
        if(res.status == 409) {
            alert("Email already exists");
        }
        console.log(res);
    }

    return (
        <div>
            <h1>Sign Up</h1>
            <form>
                <input type="text" name="name" value={user.name} onChange={handleChange} placeholder="Enter Name" />
                <br />
                <input type="email" name="email" value={user.email} onChange={handleChange} placeholder="Enter Name" />
                <br />
                <input type="password" name="password" value={user.password} onChange={handleChange} placeholder="Enter Name" />
                <br />
                <button onClick={handleSubmit}>Submit</button>
            </form>
        </div>
    )
}

export default Signup;