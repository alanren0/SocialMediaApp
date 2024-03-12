import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { feedOptionsState, recoilJwt, recoilToasts, recoilUser } from '../state'
import defaultProfilePic from '../assets/defaultProfilePic.png'

function Header() {
    const navigate = useNavigate();
    const [user, setUser] = useRecoilState(recoilUser);
    const [jwt, setJwt] = useRecoilState(recoilJwt);
    const [feedOptions, setFeedOptions] = useRecoilState(feedOptionsState);
    const [toasts, setToasts] = useRecoilState(recoilToasts);


    const signout = async () => {
        setJwt('');
        setUser(null);
        navigate('/');
        setFeedOptions({
            home: true,
            custom: false
        });
        setToasts([...toasts, {text: `You are now signed out!`, color: 'rgb(70, 192, 101)'}])

    }


    const handleSignUpBtn = () => {
        navigate('/signup')
    }

    const handleSignInBtn = () => {
        navigate('/signin')
    }

    return (
        <div className='header-container'>
            <button className='home-btn' onClick={() => navigate('/')}><strong>Home</strong></button>
            <div className='header-spacer'></div>
            <div style={{flex: 3}}>
                {!user &&
                    <div className='header-btn-container'>
                        <button className='header-btn' onClick={() => handleSignInBtn()}>Sign in</button>
                        <button className='header-btn' onClick={() => handleSignUpBtn()}>Sign up</button>
                    </div>
                }
                {user &&
                    <div className='header-btn-container'>
                        {/* <UserOptions/> */}
                        <button className='header-btn' onClick={() => signout()}>Sign Out</button>
                        <img style={{margin: '15px'}} className='user-pic' src={user.profile_pic || defaultProfilePic} onClick={() => navigate(`/user/${user.username}`)}/>
                        
                    </div>
                }
            </div>
        </div>
    )
}

export default Header