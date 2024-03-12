import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import defaultProfilePic from '../assets/defaultProfilePic.png'
import BtnFollow from "./BtnFollow";
import { recoilJwt, recoilToasts, recoilUser } from "../state";
import { useRecoilState } from "recoil";


function UserInfoContainer() {

    const {username} = useParams();

    const [jwt, setJwt] = useRecoilState(recoilJwt);
    const [myUser, setMyUser] = useRecoilState(recoilUser);

    const [user, setUser] = useState();
    const [editMode, setEditMode] = useState(false);
    const [editAlias, setEditAlias] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editImage, setEditImage] = useState();
    const [toasts, setToasts] = useRecoilState(recoilToasts);

    const getUser = async () => {
        const res = await fetch(`http://localhost:3001/users/getOne/${[username]}`);
        if (!res.ok) {
            return;
        }

        const data = await res.json();
        setEditAlias(data.user.alias || '');
        setEditBio(data.user.bio || '');
        setEditImage(data.user.profile_pic);
        setUser(data.user);
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

    const onImageChange = async (e) => {
        const bytes = await fileToBytes(e.target.files[0]);
        setEditImage(bytes);
    }

    const saveChanges = async () => {
        const res = await fetch('http://localhost:3001/users/edit', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
                alias: editAlias,
                bio: editBio,
                profilePic: editImage
            })
        })

        if (!res.ok) {
            setToasts([...toasts, {text: 'Failed to save changes. Please try again', color: 'rgb(212, 60, 60)'}])
            return;
        }

        const data = await res.json();

        setToasts([...toasts, {text: `Changes saved!`, color: 'rgb(70, 192, 101)'}])
        setUser(data.user);
        setMyUser(data.user);
        setEditMode(false);
    }

    useEffect(() => {
        getUser();
    }, [username]);


    if (!user) {
        return <div>Loading...</div>
    }
    
    return (
        <div className='full-user-info-container'>
            <div className='user-info-background'>
                {editMode &&
                    <button style={{margin: '10px 10px 0 10px'}} className='blue-btn' onClick={saveChanges}>Save Changes</button>
                }

                {myUser?.username === user.username &&
                    <button className='blue-btn' onClick={() => setEditMode(!editMode)}>{editMode ? 'Cancel' : '\u270E'}</button>
                }
                

            </div>

            <div className='user-info-header'>
                <div>
                    <img className='full-user-pic' src={user.profile_pic || defaultProfilePic}/>
                </div>
                {editMode &&
                    <div style={{position: 'absolute', transform: 'translate(170px, 20px)', display: 'flex'}}>
                        <input style={{width: '70%'}} type="file" accept="image/*" onChange={onImageChange} />
                        <div style={{fontSize: '30px', color: 'rgb(71, 71, 71)'}}>&#9998;</div>
                    </div>
                }
                

                <div className='user-handles'>
                    <div style={{flex: 1}}></div>
                    <div style={{flex: 1}}>

                        {/* alias */}
                        {!editMode &&
                            <div style={{display: 'flex', position: 'relative', width: '100%'}}>
                                <h2 style={{margin: '0 5px 0 20px', fontSize: '30px'}} className='alias'>{user.alias || user.username}</h2>
                                <p style={{margin: '12px 5px 0 5px'}} className='light-text'>{`${user.followers.length} Followers`}</p>


                                {myUser?.username !== user.username &&
                                    <BtnFollow otherUser={username} setOtherUser={setUser}/>
                                }

                            </div>
                        }
                        {editMode &&
                            <div style={{display: 'flex', position: 'relative', width: '100%'}}>
                                
                                <input className='txt-input' style={{marginLeft: '20px', fontSize: '30px', width: '100%'}} type='text' value={editAlias} onChange={e => setEditAlias(e.target.value)}/>
                                <div style={{marginRight: '20px', fontSize: '30px', color: 'rgb(71, 71, 71)'}}>&#9998;</div>
                                
                            </div>
                        }

                        {/* username */}
                        <p style={{margin: '0 0 0 20px', fontSize: '24px'}} className='light-text'>{user.username}</p>
                    </div>
                </div>

            </div>

            {/* bio */}
            <div className='user-info-bio'>
                {!editMode &&
                    <p>{user.bio || 'No Bio'}</p>
                }
                {editMode &&
                    <div style={{display: 'flex'}}>
                        <textarea style={{width: '100%', height: '100px'}} className='txt-input' value={editBio} onChange={e => setEditBio(e.target.value)}/>
                        <div style={{fontSize: '30px', color: 'rgb(71, 71, 71)'}}>&#9998;</div>
                    </div>
                }
            </div>

        </div>

    )
}

export default UserInfoContainer

