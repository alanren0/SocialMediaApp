import { useRecoilState } from "recoil";
import { recoilJwt, recoilToasts, recoilUser } from "../state";
import { useState } from "react";


function CommentEditor({ogText, commentId, setComment, setShowEditArea}) {

    const [jwt, setJwt] = useRecoilState(recoilJwt);
    const [user, setUser] = useRecoilState(recoilUser);
    const [toasts, setToasts] = useRecoilState(recoilToasts);

    const [editText, setEditText] = useState(ogText);
    

    const handleEdit = async (e) => {
        e.preventDefault();
        const res = await fetch('http://localhost:3001/comments/edit', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
                body: editText,
                commentId: commentId
            })
        });

        if (!res.ok) {
            setToasts([...toasts, {text: 'Failed to save changes. Please try again', color: 'rgb(212, 60, 60)'}])
            return;
        }

        const data = await res.json();

        setToasts([...toasts, {text: `Changes saved!`, color: 'rgb(70, 192, 101)'}])
        setComment(data.comment);
        setShowEditArea(false);
    }

    return (
        <form onSubmit={handleEdit}>
            <div style={{display: 'flex', marginBottom: '10px'}}>
                <textarea style={{width: '100%'}} className='txt-input' value={editText} onChange={e => setEditText(e.target.value)}></textarea>
                <div style={{fontSize: '30px', color: 'rgb(71, 71, 71)'}}>&#9998;</div>
            </div>
            <input style={{height: '24px', fontSize: '14px', padding: '0 10px 0 10px'}} className='blue-btn' type='submit' value='Submit Changes'/>
            <button style={{height: '24px', fontSize: '14px', marginLeft: '10px', padding: '0 10px 0 10px'}} className='blue-btn' onClick={() => setShowEditArea(false)}>Cancel</button>
        </form>
    )
}

export default CommentEditor

