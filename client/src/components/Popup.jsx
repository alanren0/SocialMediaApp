
function Popup({component, trigger, setTrigger}) {

    if (!trigger) {
        return <></>
    }

    const handleClick = (e) => {
        if (e.target.className === 'popup-container') {
            setTrigger(false);    
        }
    }

    return (
        <div className='popup-background' onClick={handleClick}>
            <div className='popup-container'>
                {component}
            </div>
        </div>
    )
}

export default Popup