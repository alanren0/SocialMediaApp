import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { recoilJwt, recoilUser } from '../state'
import UserShorterInfo from "./UserShorterInfo";

function FollowingContainer({popular}) {

    const [jwt, setJwt] = useRecoilState(recoilJwt);
    const [user, setUser] = useRecoilState(recoilUser);
    const [following, setFollowing] = useState([]);

    const getFollowing = async () => {
        if (!jwt && !popular) {
            setFollowing([]);
            return;
        }
        
        let api = 'http://localhost:3001/users/following';
        if (popular) {
            api = 'http://localhost:3001/users/popular';
        }

        const res = await fetch(api, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        });

        if (!res.ok) {
            return;
        }

        const data = await res.json();

        setFollowing(data.users);
    }

    useEffect(() => {
        getFollowing();
    }, [user]);

    return (
        <div className='following-container'>
            {following?.map(user => (
                <UserShorterInfo user={user} key={user.username} showFollowers={popular}/>
            ))}
        </div>
    )
}

export default FollowingContainer