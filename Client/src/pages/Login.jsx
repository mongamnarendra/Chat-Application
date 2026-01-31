import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const Login = () =>{
    const [user,setUser] = useState({
        email:"",
        password:""
    })
    const navigate = useNavigate();

    const handleChange = (e) =>{
        setUser({
            ...user,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async(e)=>{
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:3000/api/v1/auth/login",user);
            const token = res.data.token;
            localStorage.setItem("token",token);
            navigate("/chat")
        }
        catch(err){
            console.log(err);
        }
    }

    return(
        <div>
            <h1>Login Page</h1>
             <form>
                <input type="email" name="email" value={user.email} placeholder="Enter Email" onChange={handleChange}/>
                <br />
                <input type="password" name="password" value={user.password} placeholder="Enter Password"  onChange={handleChange}/>
                <br />
                <button onClick={handleSubmit}>Submit</button>
             </form>
        </div>
    )
}

export default Login;