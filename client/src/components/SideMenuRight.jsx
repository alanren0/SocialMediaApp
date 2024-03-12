import FollowingContainer from './FollowingContainer';

function SideMenuRight() {

    return (
        <div className='side-menu-container' style={{margin: '0 20px 0 20px'}}>
            <div className='side-menu-separator' style={{textAlign: 'left'}}>Popular Users</div>
            <FollowingContainer popular={true}/>
        </div>
    )
}

export default SideMenuRight