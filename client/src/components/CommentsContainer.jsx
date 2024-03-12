import { useEffect, useState } from "react";
import Comment from './Comment';
import BtnCreateComment from "./BtnCreateComment";
import { commentsState } from '../state'
import { useRecoilState } from "recoil";

function CommentsContainer({postId, userFilter}) {
    
    const [comments, setComments] = useRecoilState(commentsState);

    const fetchComments = async () => {
        if (!postId && !userFilter) {
            return;
        }

        let api = '';
        if (postId) {
            api = `http://localhost:3001/comments?postId=${postId}&returnUser=true`;
        } else {
            api = `http://localhost:3001/comments?username=${userFilter}&returnUser=true`;
        }
        
        const res = await fetch(api);
        if (!res.ok) {
            return;
        }

        const data = await res.json();

        if (postId) {
            setComments(commentsToTree(data.comments));
            return;
        }
        setComments(data.comments);
        
    }

    const commentsToTree = (data) => {
        // const comments = data.comments;
        const parents = [];
        const children = {};
        
        for (let i=0, n=data.length; i < n; i++) {
            // child
            const parentId = data[i].comment.parent_id;
            if (parentId) {
                const temp = children.parentId || [];
                temp.push(data[i]);
                children[parentId] = temp;
                continue;
            }

            // parent
            parents.push(data[i]);
        }

        for (let i=0, n=parents.length; i < n; i++) {
            const commentId = parents[i].comment.comment_id;
            parents[i]['children'] = children[commentId];
        }

        return parents;
    }

    useEffect(() => {
        fetchComments();
    }, []);

    
    if (!comments) {
        return <div>Loading...</div>
    }

    return (
        <div className='comments-container'>
            <BtnCreateComment postId={postId}/>
            {comments.map(comment => (
                <div key={comment.comment.comment_id}>
                    <Comment postId={postId} comment={comment.comment} user={comment.user} children={comment.children} showLinks={userFilter != null}/>
                </div>
            ))}
        </div>
    )
}

export default CommentsContainer