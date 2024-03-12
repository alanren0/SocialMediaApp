import { useEffect, useState } from "react"
import { recoilJwt, recoilShowSigninPopup, recoilUser } from '../state';
import { useRecoilState } from "recoil";

function BtnFollow({ otherUser, setOtherUser }) {

    const [followed, setFollowed] = useState(false);
    const [jwt, setJwt] = useRecoilState(recoilJwt);
    const [user, setUser] = useRecoilState(recoilUser);
    const [showSigninPopup, setShowSigninPopup] = useRecoilState(recoilShowSigninPopup);

    const followCheck = () => {
        if (!user) {
            return;
        }
        setFollowed(user.following.includes(otherUser));
    }

    const follow = async () => {
        if (!jwt) {
            setShowSigninPopup(true);
            return;
        }

        const res = await fetch('http://localhost:3001/users/follow', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
                toFollow: otherUser
            })
        })

        if (!res.ok) {
            return
        }

        const data = await res.json();

        setUser(data.user);
        setOtherUser(data.followedUser)
    }

    useEffect(() => {
        followCheck();
    }, [user]);

    return (
      <>
        <button style={{margin: '0 5px 0 5px', padding: '10px', position: 'absolute', right: 0}}className='btn' onClick={follow}>{followed? 'Unfollow' : 'Follow'}</button>
      </>
    )
}

export default BtnFollow