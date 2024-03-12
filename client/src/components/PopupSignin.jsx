import { useNavigate } from "react-router-dom"
import { recoilShowSigninPopup } from "../state";
import { useRecoilState } from "recoil";


function PopupSignin() {

    const [showSigninPopup, setShowSigninPopup] = useRecoilState(recoilShowSigninPopup);

    const nav = (path) => {
        
        navigate(path);
        setShowSigninPopup(false);
    }

    const navigate = useNavigate();

    return (
        <div className='popup-signin-container'>
            <h3>You need to sign in to use this feature</h3>
            <button className='blue-btn' onClick={() => nav('/signin')}>Sign in!</button>
            <h3>Don't have an account?</h3>
            <button className='blue-btn' onClick={() => nav('/signup')}>Sign up!</button>
        </div>
    )
}

export default PopupSignin