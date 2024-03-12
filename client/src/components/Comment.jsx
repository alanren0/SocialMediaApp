import { useState } from "react"
import UserShortInfo from "./UserShortInfo"
import BtnCreateComment from "./BtnCreateComment";
import { recoilUser } from "../state";
import { useRecoilState } from 'recoil';
import CommentEditor from "./CommentEditor";
import { Link } from "react-router-dom";

function Comment({postId, comment, user, children, showLinks}) {

    const [myUser, setMyUser] = useRecoilState(recoilUser);

    const [showReplies, setShowReplies] = useState(false);
    const [showEditArea, setShowEditArea]  = useState(false);
    const [commentState, setCommentState] = useState(comment);
    const [childrenState, setChildrenState] = useState(children)

    return (
        <div className='comment-container'>

            {/* user info */}
            <div style={{display: 'flex', alignItems: 'center'}}>
                <UserShortInfo user={user}/>
                {myUser?.username === user.username &&
                    <>
                        <div style={{flex: 1}}></div>
                        <button 
                            style={{height: '24px', fontSize: '14px', margin: 0}} 
                            className='blue-btn' 
                            onClick={() => setShowEditArea(!showEditArea)}
                        >
                            &#9998;
                        </button>
                    </>
                }
            </div>


            {/* comment body/edit area */}
            {!showEditArea &&
                <div className='comment-body'>{commentState.body}</div>
            }
            {showEditArea &&
                <CommentEditor ogText={commentState.body} commentId={commentState.comment_id} setComment={setCommentState} setShowEditArea={setShowEditArea}/>
            }

            {/* back link to post */}
            {showLinks &&
                <div>
                    Commented on post: <Link to={`/post/${commentState.post_id}`}>{commentState.post_id}</Link>
                </div>
            }
            
            {/* replies area */}
            {postId &&
                <>
                    <div style={{display: 'inline-block', width: '100%', margin: '10px 0 10px 0'}}>

                        <BtnCreateComment postId={postId} parentId={commentState.comment_id} children={childrenState || []} setChildren={setChildrenState} setShowReplies={setShowReplies}/>
                        {childrenState &&
                            <div style={{cursor: 'pointer'}} onClick={() => setShowReplies(!showReplies)}>
                                {showReplies? 'Hide Replies' : 'Show Replies'}
                            </div>
                        }
                    </div>
                </>
            }

            {/* show replies area */}
            {showReplies && childrenState?.map(child => (
                <div key={child.comment.comment_id} className='child-comment-container'>
                    <Comment comment={child.comment} user={child.user}/>
                </div>
            ))}
        </div>
    )
}

export default Comment


