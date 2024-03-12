import { useEffect, useState } from "react"
import { useRecoilState } from "recoil";
import { recoilJwt, recoilResetPosts, recoilToasts, recoilUser } from '../state';
import { useLocation, useNavigate } from 'react-router-dom';
import Post from "../components/Post";

function CreatePost() {
    const navigate = useNavigate()
    const location = useLocation();

    let postId = null;
    let ogBody = null;
    let ogImages = null;
    if (location.state) {
        postId = location.state['postId']
        ogBody = location.state['ogBody']
        ogImages = location.state['ogImages']
    }

    const [resetPosts, setResetPosts] = useRecoilState(recoilResetPosts)
    const [jwt, setJwt] = useRecoilState(recoilJwt);
    const [user, setUser] = useRecoilState(recoilUser)
    const [toasts, setToasts] = useRecoilState(recoilToasts);


    const [body, setBody] = useState(ogBody || '');
    const [byteImages, setByteImages] = useState(ogImages || []);

    const [postPreview, setPostPreview] = useState({
        'id': '',
        'username': user?.username,
        'body': ogBody || '',
        'images': ogImages || [],
        'liked_by': [],
        'likes': 0,
        'views': 0,
        'date_posted': new Date().toDateString(),
        'last_modified': new Date().toDateString(),
        'share_id': ''
    });

    
    useEffect(() => {
        if (!jwt) {
            navigate('/')
        }
    }, [])
    

    const handleBody = e => {
        setBody(e.target.value);
        postPreview['body'] = e.target.value;
    }


    const fileToBytes = (file) => {

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
    
            reader.onload = (event) => {
                resolve(event.target.result);
            };
    
            reader.onerror = (err) => {
                reject(err);
            };
    
            reader.readAsDataURL(file);
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        let api = 'http://localhost:3001/posts/create';
        let method = 'POST'
        let payload = {
            body: body,
            images: byteImages
        }
        if (postId) {
            api = 'http://localhost:3001/posts/edit';
            method = 'PATCH'
            payload['id'] = postId
        }
        
        

        const res = await fetch(api, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            if (postId) {
                setToasts([...toasts, {text: 'Failed to edit post. Please try again', color: 'rgb(212, 60, 60)'}])
            } else {
                setToasts([...toasts, {text: 'Failed to create post. Please try again', color: 'rgb(212, 60, 60)'}])
            }
            return
        }

        const data = await res.json()

        setResetPosts(!resetPosts);
        if (postId) {
            setToasts([...toasts, {text: 'Successfully edited your post!', color: 'rgb(70, 192, 101)'}])
        } else {
            setToasts([...toasts, {text: 'Created new post!', color: 'rgb(70, 192, 101)'}])
        }
        
        navigate(`/post/${data.post.id}`)
        
    }

    const onImageChange = async (e) => {
        const images  = [...e.target.files];
        const bytes = await Promise.all(images.map(image => (fileToBytes(image))));

        setByteImages(bytes);
        postPreview['images'] = bytes;
    }

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>

            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'top', height: '100vh', width: '100vw', paddingTop: '150px'}}>

                {/* form */}
                <form className='create-post-container' onSubmit={handleSubmit}>
                    <h1 style={{textAlign: 'center'}}>Create a Post!</h1>
                    <label>Body</label>
                    <textarea style={{margin: '20px 0 20px 0', height: '100px'}} className='txt-input' value={body} onChange={handleBody}/>
                    <div style={{marginBottom: '20px'}}>
                        <label>Add images: &nbsp;</label>
                        <input type="file" multiple accept="image/*" onChange={onImageChange} />
                    </div>
                    <input className='blue-btn' type='submit' value={postId? 'Edit Post' : 'Create Post'}/>
                </form>   

                {/* preview */}
                {jwt &&
                    <div style={{flex: 2, marginRight: '50px', minWidth: 0}}>
                        <Post post={postPreview} user={user}/>
                    </div>
                }

            </div>

            </>
    )
}

export default CreatePost