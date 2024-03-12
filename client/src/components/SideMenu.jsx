import { useRecoilState } from 'recoil';
import { feedOptionsState, recoilUser } from '../state';
import { useLocation, useNavigate } from 'react-router-dom';
import defaultProfilePic from '../assets/defaultProfilePic.png'
import UserOptions from "./UserOptions";
import FollowingContainer from './FollowingContainer';
import { useEffect } from 'react';
import { recoilJwt } from '../state'
import { recoilShowSigninPopup } from '../state';

function SideMenu() {
    const navigate = useNavigate()
    const location = useLocation();

    const [jwt, setJwt] = useRecoilState(recoilJwt);
    const [showSigninPopup, setShowSigninPopup] = useRecoilState(recoilShowSigninPopup);

    const [feedOptions, setFeedOptions] = useRecoilState(feedOptionsState);
    const [user, setUser] = useRecoilState(recoilUser);

    const handleFeedOptions = (feed) => {
        if (feed === 'custom' && !jwt) {
            setShowSigninPopup(true);
            return;
        }

        const newFeed = {
            home: false,
            custom: false
        };

        newFeed[feed] = true;

        navigate('/')
        setFeedOptions(newFeed);
        
    }

    const handleProfileNav = () => {
        if (!jwt) {
            setShowSigninPopup(true);
            return;
        }

        navigate(`/user/${user.username}`);
    }

    useEffect(() => {
        if (location.pathname != '/') {
            setFeedOptions({
                home: false,
                custom: false
            });
        } else if (!feedOptions['home'] && !feedOptions['custom']) {
            setFeedOptions({
                home: true,
                custom: false
            });
        }
    }, [navigate]);


    return (
        <div className='side-menu-container'>

            {/* profile button */}
            <div className='side-menu-separator' style={{textAlign: 'left'}}>Profile</div>

            <button className='side-menu-btn' 
                style={location.pathname == `/user/${user?.username}` ? {backgroundColor: '#5386E4', color: 'white', boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px'}: {}} 
                onClick={() => handleProfileNav()}
            >
                Your Profile
            </button>

            {/* feed buttons */}
            <div className='side-menu-separator' style={{textAlign: 'left'}}>Feeds</div>

            <button className='side-menu-btn' 
                style={feedOptions['home'] ? {backgroundColor: '#5386E4', color: 'white', boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px'}: {}} 
                onClick={() => handleFeedOptions('home')}
            >
                Explore
            </button>

            <button className='side-menu-btn' 
                style={feedOptions['custom'] ? {backgroundColor: '#5386E4', color: 'white', boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px'}: {}} 
                onClick={() => handleFeedOptions('custom')}
            >
                Your Feed
            </button>

            {/* create post button */}
            <div className='side-menu-separator' style={{textAlign: 'left'}}>Actions</div>

            <button className='side-menu-btn' onClick={() => jwt ? navigate('/post/create') : setShowSigninPopup(true)}>
                Create a Post
            </button>

            {/* following users */}
            {jwt &&
                <>
                    <div className='side-menu-separator' style={{textAlign: 'left'}}>Following</div>

                    <FollowingContainer/>
                </>
            }
        </div>
    )
}

export default SideMenu