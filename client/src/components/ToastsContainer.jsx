import { useRecoilState } from "recoil"
import { recoilToasts } from '../state'
import Toast from "./Toast";

function ToastsContainer() {

    const [toasts, setToasts] = useRecoilState(recoilToasts);

    return (
        <>
            {toasts.map((toast, index) => (
                <Toast key={`toast ${index}`} toast={toast} index={index}/>
            ))}
        </>
    )
}

export default ToastsContainer