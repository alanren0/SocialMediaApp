import { useState } from "react"

function PopupPostImages({images}) {

    const [index, setIndex] = useState(0);

    const prev = () => {
        if (index <= 0) {
            return;
        }
        setIndex(index - 1);
    }

    const next = () => {
        if (index >= images.length - 1) {
            return;
        }
        setIndex(index + 1);
    }

    return (
        <div className='popup-images-container'>
            
            {index > 0 &&
                <button style={{borderRadius: '20px 0 0 20px'}} className='popup-nav-btn' onClick={prev}>&#10094; Prev</button>
            }
            <div className='popup-img-container'>
                <img className='popup-img' src={images[index]}/>
            </div>
            
            {index < images.length - 1 &&
                <button style={{borderRadius: '0 20px 20px 0'}} className='popup-nav-btn' onClick={next}>Next &#10095;</button>
            }
            <div style={{position: 'absolute', bottom: 0, left: '50%', transform: 'translateY(30px)', backgroundColor: 'rgba(255, 255, 255, 0.4)', borderRadius: '10px', padding: '5px'}}>{index + 1} / {images.length}</div>  
        </div>
    )
}

export default PopupPostImages