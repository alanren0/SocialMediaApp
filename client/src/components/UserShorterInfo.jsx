import { Link } from 'react-router-dom'
import defaultProfilePic from '../assets/defaultProfilePic.png'

function UserShorterInfo({user, showFollowers}) {

    return (
        <Link style={{color: 'black'}} to={`/user/${user.username}`}>
            <div className='side-user-info-container'>
                <div className='user-pic-container'>
                    <img style={{width: '20px', height: '20px'}} className='user-pic' src={user.profile_pic || defaultProfilePic}/>
                </div>
                <div className='side-user-name-container' style={{display: 'flex'}}>
                    <p style={{fontSize: '16px', margin: 0, color: 'inherit', flex: 1}}>{user.alias || user.username}</p>
                    {showFollowers &&
                        <p style={{fontSize: '12px', margin: '3px 0 0 0', }} > &nbsp;&nbsp;{user.followers.length} followers</p>
                    }
                </div>
            </div>
        </Link>
    )
}

export default UserShorterInfo