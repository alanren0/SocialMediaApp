import { useRecoilState } from 'recoil';
import { recoilJwt, recoilUser } from '../state';
import { useNavigate } from 'react-router-dom';



function UserOptions() {
    const navigate = useNavigate();

    const [jwt, setJwt] = useRecoilState(recoilJwt);
    const [user, setUser] = useRecoilState(recoilUser);

    const signout = () => {
        setJwt('');
        setUser(null);
        window.location.reload();
    }



    return (
        <div className='header-user-options-container'>
            <button className='side-menu-btn' onClick={() => navigate(`/user/${user.username}`)}>View Profile</button>
            <button className='side-menu-btn' onClick={signout}>Sign Out</button>
            
        </div>
    )
}

export default UserOptions