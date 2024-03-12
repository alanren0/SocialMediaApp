import { Link } from 'react-router-dom'
import defaultProfilePic from '../assets/defaultProfilePic.png'

function UserShortInfo({user}) {

    return (
        <Link style={{color: 'black'}} to={`/user/${user.username}`}>
            <div className='user-info-container'>
                <div className='user-pic-container'>
                    <img className='user-pic' src={user.profile_pic || defaultProfilePic}/>
                </div>
                <div className='user-name-container'>
                    <p className='alias'>{user.alias || user.username}</p>
                    <p className='light-text'>{user.username}</p>
                    
                </div>
            </div>
        </Link>
    )
}

export default UserShortInfo