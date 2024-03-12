import BtnLike from "./BtnLike"


function PostStats({post, setPost}) {

    const shortenDate = (date) => {
        return date.split(' ').slice(0, 4).join(' ');
    }


    return (
        <div className='post-stats'>
            
            <div style={{width: '45px', flex: '0 0 auto', borderRight: '2px solid rgb(173, 195, 255)'}}>
                <BtnLike post={post} setPost={setPost}/>
            </div>

            <div style={{flex: 2, borderRight: '2px solid rgb(173, 195, 255)'}}>
                
                Likes: {post.likes}
            </div>
            <div style={{flex: 2, borderRight: '2px solid rgb(173, 195, 255)'}}>
                Views: {post.views}
            </div>
            <div style={{flex: 2}}>
                {shortenDate(post.date_posted)}
            </div>
            {post?.date_posted.localeCompare(post.last_modified) != 0 &&
                <div style={{flex: 1, borderLeft: '2px solid rgb(173, 195, 255)', fontSize: '16px'}} className='light-text'>
                    * Edited
                </div>
            }
        </div>        
    )
}

export default PostStats

