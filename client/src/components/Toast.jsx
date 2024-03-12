import { useRecoilState } from "recoil"
import { recoilToasts } from "../state"
import { useState } from "react"


function Toast({toast, index}) {

    const [toastState, setToastState] = useState(toast);
    const [toasts, setToasts] = useRecoilState(recoilToasts);

    const removeToast = () => {
        // clear toasts
        if (index === toasts.length - 1) {
            setToasts([]);
        }
    }

    return (
        <div className='toast' 
            onAnimationEnd={() => removeToast()}
            style={{
                borderLeft: `6px solid ${toast.color}`, 
                top: `${100 + index * 10}px`
            }}
        >
            {toast.text}
        </div>
    )
}

export default Toast