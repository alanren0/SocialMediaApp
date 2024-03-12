import { useEffect, useState } from "react";
import {useParams} from "react-router-dom";
import Post from "../components/Post";
import CommentsContainer from "../components/CommentsContainer";
import SideMenu from "../components/SideMenu";

function PostPage() {
    const {postId} = useParams();

    const [post, setPost] = useState();
    const [postUser, setPostUser] = useState();

    const getPost = async () => {
        const res = await fetch(`http://localhost:3001/posts/getOne/${postId}`);

        if (!res.ok) {
            return;
        }

        const data = await res.json();
        setPost(data.post);
    }

    const getUser = async () => {
        const res = await fetch(`http://localhost:3001/users/getOne/${[post.username]}`);

        if (!res.ok) {
            return;
        }

        const data = await res.json();
        setPostUser(data.user);
    }

    useEffect(() => {
        if (!post) {
            return;
        }
        getUser();
    }, [post]);

    useEffect(() => {
        getPost();
    }, [postId]);
    
    if (!post || !postUser) {
        return <div>Loading...</div>
    }
 
    return (
        <>
            <div className='main-container'>
                <div className='main-side'>
                    <SideMenu/>
                </div>
                <div style={{display: 'flex', flex: 9, marginTop: '70px', padding: 0, minWidth: 0}}>
                    <div style={{flex: 1, minWidth: 0}}>
                        <div style={{marginRight: '20px'}}>
                            <Post post={post} user={postUser}/>
                        </div>
                        <div style={{marginRight: '20px'}}>
                            <CommentsContainer postId={post.id}/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PostPage