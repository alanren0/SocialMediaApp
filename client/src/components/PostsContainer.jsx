import Filters from "./Filters"
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilState } from 'recoil';
import { recoilPosts, recoilJwt, feedOptionsState, recoilResetPosts, recoilUser } from '../state';
import { reverseState, sortByState, dateLimitState } from '../state';
import Post from "./Post";

function PostsContainer({userFilter, likedBy, userFeed}) {

    const [posts, setPosts] = useRecoilState(recoilPosts);
    const [reverse, setReverse] = useRecoilState(reverseState);
    const [sortBy, setSortBy] = useRecoilState(sortByState);
    const [dateLimit, setDateLimit] = useRecoilState(dateLimitState);
    const [jwt, setJwt] = useRecoilState(recoilJwt);
    const [user, setUser] = useRecoilState(recoilUser);
    const [feedOptions, setFeedOptions] = useRecoilState(feedOptionsState);
    const [resetPosts, setResetPosts] = useRecoilState(recoilResetPosts)

    

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const fetchPosts = async (offset) => {
        setIsLoading(true);

        if (offset === 0 && !userFilter && !likedBy) {
            setPosts([]);
            window.scrollTo(0, 0);
        }

        let api = `http://localhost:3001/posts?limit=5&returnUser=true&offset=${offset}&reverse=${reverse}&sortBy=${sortBy}&dateLimit=${dateLimit}`;
        if (userFilter != null) { // on user page -> posts
            api = api + `&username=${userFilter}`;
        }
        else if (likedBy) { // on user page -> likes
            api = `http://localhost:3001/posts/likedBy/${likedBy}?limit=5&returnUser=true&offset=${offset}`;
        }
        else if (userFeed && jwt) { // on user's custom feed
            api = `http://localhost:3001/posts/custom?limit=5&returnUser=true&offset=${offset}&reverse=${reverse}&sortBy=${sortBy}&dateLimit=${dateLimit}`;   
        }

        const res = await fetch(api, {
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        });
        if (!res.ok) {
            return
        }

        const data = await res.json()

        if (offset === 0) {
            setPosts(data.posts)
        } else {
            setPosts([...posts, ...data.posts])
        }

        setIsLoading(false);
    }

    const handleScroll = () => {
        if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isLoading) {
          return;
        }
        fetchPosts(posts?.length || 0);
    };
    
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoading]);

    useEffect(() => {
        fetchPosts(0);
    }, [navigate, reverse, sortBy, dateLimit, userFilter, feedOptions, resetPosts, user]);

    useEffect(() => {
        // reset filters
        setReverse(false);
        setSortBy('date_posted');
        setDateLimit('all');
    }, [navigate]);

    if (posts?.length === 0) {
        return <div>No posts</div>
    }

    return (
        <div className='posts-container'>
            {posts?.map((post, index) => (
                <Post key={post.post.id} post={post.post} user={post.user} index={index}/>
            ))}
        </div>
    )
}

export default PostsContainer