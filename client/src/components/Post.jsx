import { Link, useNavigate } from "react-router-dom";
import PostImages from "./PostImages";
import PostStats from "./PostStats";
import UserShortInfo from "./UserShortInfo";
import { useState } from "react";
import { recoilUser } from '../state';
import { useRecoilState } from "recoil";


function Post({post, user}) {
    const navigate = useNavigate();

    const [postState, setPostState] = useState(post);
    const [myUser, setMyUser] = useRecoilState(recoilUser);

    const handleEdit = () => {
        navigate('/post/create', {state: {postId: postState.id, ogBody: postState.body, ogImages: postState.images}});
    }

    return (
        <div className='post'>
            <div style={{padding: '10px'}}>
                <div style={{display: 'flex'}}>

                    {/* user info */}
                    <UserShortInfo user={user}/>
                    {myUser?.username === user.username &&
                        <>
                            <div style={{flex: 1}}></div>
                            <button style={{height: '24px', fontSize: '14px', margin: 0}} className='blue-btn' onClick={handleEdit}>&#9998;</button>
                        </>
                    }
                </div>

                {/* post body */}
                <Link style={{color: 'black', width: '100%'}} to={`/post/${postState.id}`}>
                    <div className='post-body' style={{width: '100%'}}>
                        <p>
                            {post.body}
                        </p>
                    </div>
                </Link>
                <PostImages images={postState.images}/>
            </div>

            {/* stats */}
            <div className='post-stats-container'>
                <PostStats post={postState} setPost={setPostState}/>
            </div>
        </div>
    )
}

export default Post