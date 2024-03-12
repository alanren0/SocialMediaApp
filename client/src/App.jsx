import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/header.css'
import './styles/posts.css'
import './styles/users.css'
import './styles/filters.css'
import './styles/comments.css'
import './styles/sideMenu.css'
import './styles/popup.css'
import './styles/toasts.css'
import Home from './pages/Home';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import UserPage from './pages/UserPage';
import PostPage from './pages/PostPage';
import CreatePost from './pages/CreatePost';
import Popup from './components/Popup';
import ToastsContainer from './components/ToastsContainer';
import PopupPostImages from './components/PopupPostImages';
import PopupSignin from './components/PopupSignin';
import { recoilPostImages, recoilShowImagesPopup, recoilShowSigninPopup } from './state';
import { useRecoilState } from 'recoil';
import Header from './components/Header';

function App() {

    const [showSigninPopup, setShowSigninPopup] = useRecoilState(recoilShowSigninPopup);
    const [showImagesPopup, setShowImagesPopup] = useRecoilState(recoilShowImagesPopup);
    const [postImages, setPostImages] = useRecoilState(recoilPostImages);

    return (
        <BrowserRouter>
            <div className='sticky-container'>
                <Popup component={<PopupSignin/>} trigger={showSigninPopup} setTrigger={setShowSigninPopup}/>
                <Popup component={<PopupPostImages images={postImages}/>} trigger={showImagesPopup} setTrigger={setShowImagesPopup}/>
                <ToastsContainer/>
                <Header/>
            </div>
            <Routes>
                <Route path='/' element={<Home/>}></Route>
                <Route path='/signin' element={<Signin/>}></Route>
                <Route path='/signup' element={<Signup/>}></Route>
                <Route path='/user/:username' element={<UserPage/>}></Route>
                <Route path='/post/:postId' element={<PostPage/>}></Route>
                <Route path='/post/create' element={<CreatePost/>}></Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
