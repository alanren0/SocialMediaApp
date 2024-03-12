import { useRecoilState } from 'recoil';
import { recoilPostImages, recoilShowImagesPopup } from '../state';

function PostImages({images}) {
    const [showImagesPopup, setShowImagesPopup] = useRecoilState(recoilShowImagesPopup);
    const [postImages, setPostImages] = useRecoilState(recoilPostImages);


    const handleClick = () => {
        setPostImages(images);
        setShowImagesPopup(true);
    }

    if (images.length == 0) {
        return <></>
    }
        
    return (
        <div onClick={handleClick}>
            <div className='post-image-container' style={{position: 'relative'}}>
                {images.length > 1 &&
                    <div style={{position: 'absolute', top: '10px', right: '10px'}}>1 / {images.length}</div>    
                }

                <img className='post-image' src={images[0]}/>
                
            </div>
        </div>
    )
}

export default PostImages