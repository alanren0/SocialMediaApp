import { useRecoilState } from 'recoil';
import { recoilUserListOptions } from '../state';

function UserListOptions() {

    const [options, setOptions] = useRecoilState(recoilUserListOptions);

    const handleOptions = (selected) => {
        const temp = {
            posts: false,
            comments: false,
            likes: false,
            following: false,
        }

        temp[selected] = true

        setOptions(temp);
    }

    return (
        <div className='user-feed-options-container'>
            <button className='side-menu-btn' 
                style={options['posts'] ? {backgroundColor: '#5386E4', color: 'white', boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px'}: {fontSize: '14px'}} 
                onClick={() => handleOptions('posts')}
            >
                Posts
            </button>

            <button className='side-menu-btn'
                style={options['comments'] ? {backgroundColor: '#5386E4', color: 'white', boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px'}: {fontSize: '14px'}} 
                onClick={() => handleOptions('comments')}
            >
                Comments
            </button>
            
            <button className='side-menu-btn' 
                style={options['likes'] ? {backgroundColor: '#5386E4', color: 'white', boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px'}: {fontSize: '14px'}} 
                onClick={() => handleOptions('likes')}
            >
                Likes
            </button>
        </div>
    )
}

export default UserListOptions
