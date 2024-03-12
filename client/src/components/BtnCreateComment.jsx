import { useRecoilState } from "recoil";
import { recoilJwt, recoilUser, commentsState, recoilToasts } from '../state';
import { useState } from "react";

function BtnCreateComment({ postId, parentId, children, setChildren, setShowReplies }) {

    const [jwt, setJwt] = useRecoilState(recoilJwt);
    const [comments, setComments] = useRecoilState(commentsState);
    const [user, setUser] = useRecoilState(recoilUser);
    const [showCommentArea, setShowCommentArea] = useState(false);
    const [body, setBody] = useState('')
    const [toasts, setToasts] = useRecoilState(recoilToasts);



    const handleSubmit = async (e) => {
        e.preventDefault()

        const payload = {
            body: body,
            postId: postId
        }

        if (parentId) {
            payload['parentId'] = parentId;
        }

        const res = await fetch('http://localhost:3001/comments/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            setToasts([...toasts, {text: 'Failed to create comment. Please try again', color: 'rgb(212, 60, 60)'}])
            return;
        }

        const data = await res.json();
        console.log(data);
        const newComment = {
            comment: data.comment,
            user: user
        }

        setToasts([...toasts, {text: `New comment created!`, color: 'rgb(70, 192, 101)'}])
        setShowCommentArea(false);
        setBody('');

        if (parentId) {
            
            setChildren([newComment, ...children])
            setShowReplies(true);
            console.log([newComment, ...children]);
            return;
        }

        console.log('iweiweo');

        setComments([newComment, ...comments]);
    }

    if (!postId) {
        return <></>
    }

    return (
        <>
            {!parentId &&
                <button className='blue-btn' onClick={() => setShowCommentArea(!showCommentArea)}>Add a Comment!</button>
            }

            {showCommentArea &&
                <form onSubmit={handleSubmit} style={{marginBottom: '10px'}}>
                    <div style={{display: 'flex', marginBottom: '10px'}}>
                        <textarea style={{width: '100%'}} className='txt-input' value={body} onChange={e => setBody(e.target.value)}></textarea>
                        <div style={{fontSize: '30px', color: 'rgb(71, 71, 71)'}}>&#9998;</div>
                    </div>
                    <input style={{height: '24px', fontSize: '14px', padding: '0 10px 0 10px'}} className='blue-btn' type='submit' value='Submit Comment'/>
                    <button style={{height: '24px', fontSize: '14px', marginLeft: '10px', padding: '0 10px 0 10px'}} className='blue-btn' onClick={() => setShowCommentArea(false)}>Cancel</button>
                </form>
            }

            {parentId &&
                <div style={{marginRight: '10px', float: 'left', cursor: 'pointer'}} onClick={() => setShowCommentArea(!showCommentArea)}>Reply</div>
            }

            
        </>
    )
}

export default BtnCreateComment
