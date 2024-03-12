
import { useRecoilState } from 'recoil';
import { recoilJwt, recoilUser, recoilShowSigninPopup } from '../state';
import { useEffect, useState } from 'react';

function BtnLike({post, setPost}) {

    const [jwt, setJwt] = useRecoilState(recoilJwt);
    const [user, setUser] = useRecoilState(recoilUser);
    const [liked, setLiked] = useState(false);
    const [showSigninPopup, setShowSigninPopup] = useRecoilState(recoilShowSigninPopup);


    const likeCheck = () => {
        if (!user) {
            return;
        }
        setLiked(post.liked_by.includes(user.username));
    }

    const like = async () => {
        if (!jwt) {
            setShowSigninPopup(true);
            return;
        }

        const body = JSON.stringify({
            id: post.id
        })

        const res = await fetch('http://localhost:3001/posts/like', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: body
        });
        
        if (!res.ok) {
            return;
        }

        const data = await res.json();
        
        setPost(data.post);
        
    }

    useEffect(() => {
        likeCheck();
    }, [post]);

    return (
        <>
            {!liked &&
                <div onClick={like} className='like-btn'>&#9786;</div>
            }
            {liked &&
                <div onClick={like} className='like-btn' style={{color: 'rgb(37, 93, 196)'}}>&#9787;</div>
            }
            {/* <button onClick={like} style={{backgroundColor: liked? 'pink' : ''}}>Like</button> */}
        </>
    )
}

export default BtnLike