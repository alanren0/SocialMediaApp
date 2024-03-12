import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { recoilToasts } from '../state';
import { useRecoilState } from 'recoil';

function Signup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [verify, setVerify] = useState('');
    const [toasts, setToasts] = useRecoilState(recoilToasts)

    const navigate = useNavigate();

    const handleUsername = e => ( setUsername(e.target.value) )
    const handlePassword = e => ( setPassword(e.target.value) )
    const handleVerify = e => ( setVerify(e.target.value) )

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password != verify) {
            setToasts([...toasts, {text: 'Failed to sign up. Please try again', color: 'rgb(212, 60, 60)'}])
            return
        }

        // payload
        const payload = JSON.stringify({
            username: username,
            password: password
        });

        // fetch
        const res = await fetch('http://localhost:3001/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: payload
        });

        if (!res.ok) {
            setToasts([...toasts, {text: 'Failed to sign up. Please try again', color: 'rgb(212, 60, 60)'}])
            return
        }

        const data = await res.json();

        setToasts([...toasts, {text: 'Sign up successful!', color: 'rgb(70, 192, 101)'}])
        navigate('/signin')
    }

    return (
        <>
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw'}}>
                <div className='auth-container'>
                    <h1 style={{textAlign: 'center'}}>Sign Up!</h1>
                    <form style={{textAlign: 'center', width: '100%'}} onSubmit={handleSubmit}>
                        <input style={{margin: '10px 0 10px 0', width: '70%'}} className='txt-input' type='text' value={username} placeholder={'Username'} onChange={handleUsername}/>
                        <br></br>
                        <input style={{margin: '10px 0 10px 0', width: '70%'}} className='txt-input' type='password' value={password} placeholder={'Password'} onChange={handlePassword}/>
                        <br></br>
                        <input style={{margin: '10px 0 10px 0', width: '70%'}} className='txt-input' type='password' value={verify} placeholder={'Confirm Password'} onChange={handleVerify}/>
                        <br></br>
                        <input className='blue-btn' type='submit' value='Sign In'/>


                        <div style={{marginTop: '20px'}}>Already have an account?</div>
                        <div ><Link to='/signin'>Sign In!</Link></div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Signup
