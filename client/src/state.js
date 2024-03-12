import { atom } from 'recoil';

export const recoilUser = atom({
    key: 'user',
    default: null
});

export const recoilJwt = atom({
    key: 'jwt',
    default: ''
});

export const recoilOffset = atom({
    key: 'offset',
    default: 0
});

// post filters
export const reverseState = atom({
    key: 'reverse',
    default: false
});

export const sortByState = atom({
    key: 'sortBy',
    default: 'date_posted'
});

export const dateLimitState = atom({
    key: 'dateLimit',
    default: 'all'
});

export const recoilUserListOptions = atom({
    key: 'userListOptions',
    default: {
        posts: true,
        comments: false,
        likes: false,
        following: false,
    }
});

export const commentsState = atom({
    key: 'comments',
    default: []
});

export const feedOptionsState = atom({
    key: 'feedOptions',
    default: {
        home: true,
        custom: false
    }
});

export const recoilResetPosts = atom({
    key: 'resetPosts',
    default: false
});

export const recoilShowSigninPopup = atom({
    key: 'showSigninPopup',
    default: false
});

export const recoilShowImagesPopup = atom({
    key: 'showImagesPopup',
    default: false
});

export const recoilPostImages = atom({
    key: 'postImages',
    default: []
});

export const recoilToasts = atom({
    key: 'toasts',
    default: []
});