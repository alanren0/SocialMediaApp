
import { useRecoilState } from 'recoil';
import { feedOptionsState} from '../state';
import PostsContainer from "../components/PostsContainer";
import SideMenu from "../components/SideMenu";
import SideMenuRight from "../components/SideMenuRight";
import Filters from "../components/Filters";


function Home() {


    const [feedOptions, setFeedOptions] = useRecoilState(feedOptionsState);

    return (
        <>
            <div className='main-container'>
                <div className='main-side'>
                    <SideMenu/>
                </div>
                <div className='main-body'>
                    <Filters/>
                    {feedOptions['home'] &&
                        <PostsContainer/>
                    }
                    {feedOptions['custom'] &&
                        <PostsContainer userFeed={true}/>
                    }
                </div>
                <div className='main-side' style={{flex: 3}}>
                    <SideMenuRight/>
                </div>
                
            </div>
        </>
    )
}

export default Home