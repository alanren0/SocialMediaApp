import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import PostsContainer from "../components/PostsContainer";
import UserInfoContainer from "../components/UserInfoContainer";
import CommentsContainer from "../components/CommentsContainer";
import UserListOptions from "../components/UserListOptions";

import { recoilUserListOptions } from '../state';
import { useRecoilState } from "recoil";
import SideMenu from "../components/SideMenu";


function UserPage() {
    const {username} = useParams();

    const [options, setOptions] = useRecoilState(recoilUserListOptions);


    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <div className='main-container'>
                <div className='main-side'>
                    <SideMenu profileView={true}/>
                </div>
                <div className='main-body' style={{flex: 7}}>
                    <UserInfoContainer/>
                    <UserListOptions/>
                    {options['posts'] &&
                        <PostsContainer userFilter={username}/>
                    }
                    {options['comments'] &&
                        <CommentsContainer userFilter={username}/>
                    }
                    {options['likes'] &&
                        <PostsContainer likedBy={username}/>
                    }
                    {/* {options['following'] &&
                        <FollowingContainer username={username}/>
                    } */}

                </div>
                <div className='main-side'></div>
            </div>
        </>
    )
}

export default UserPage

