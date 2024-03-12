import { useState } from "react"
import { useRecoilState } from "recoil";
import { recoilUser, recoilJwt, recoilToasts } from '../state'
import { Link, useNavigate } from "react-router-dom";

function Signin() {
    const [user, setUser] = useRecoilState(recoilUser)
    const [jwt, setJwt] = useRecoilState(recoilJwt)

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [toasts, setToasts] = useRecoilState(recoilToasts)


    const navigate = useNavigate()

    const handleUsername = (e) => {
        setUsername(e.target.value);
    }

    const handlePassword = (e) => {
        setPassword(e.target.value);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // payload
        const payload = JSON.stringify({
            username: username,
            password: password
        });

        // fetch
        const res = await fetch('http://localhost:3001/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: payload
        });

        if (!res.ok) {
            setToasts([...toasts, {text: 'Failed to sign in. Please try again', color: 'rgb(212, 60, 60)'}])
            return;
        }

        const data = await res.json();

        setUser(data.user)
        setJwt(data.token)
        setToasts([...toasts, {text: `Signed in as ${data.user.username}`, color: 'rgb(70, 192, 101)'}])
        navigate('/')
    }

    return (
        <>
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw'}}>
                <div className='auth-container'>
                    <h1 style={{textAlign: 'center'}}>Sign In!</h1>
                    <form style={{textAlign: 'center', width: '100%'}}onSubmit={handleSubmit}>
                        <input style={{margin: '10px 0 10px 0', width: '70%'}} className='txt-input' type='text' value={username} placeholder={'Username'} onChange={handleUsername}/>
                        <br></br>
                        <input style={{margin: '10px 0 10px 0', width: '70%'}} className='txt-input' type='password' value={password} placeholder={'Password'} onChange={handlePassword}/>
                        <br></br>
                        
                        <input className='blue-btn' type='submit' value='Sign In'/>

                        <div style={{marginTop: '20px'}}>Don't have an account?</div>
                        <div ><Link to='/signup'>Sign Up!</Link></div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Signin