from functools import wraps
import jwt
from flask import request, jsonify
from flask import current_app
import logging

logger = logging.getLogger(__name__)
FORMAT = "[%(filename)s:%(lineno)s - %(funcName)20s() ] %(message)s"
logging.basicConfig(format=FORMAT)
logger.setLevel(logging.DEBUG)


def token_required(func):
    @wraps(func)
    def decorated(*args, **kwargs):
        print('authenticating')
        token = None

        # get token
        if "Authorization" in request.headers:
            token = request.headers["Authorization"].split(" ")[1]

        # no token
        if not token:
            return jsonify({'Message': 'Token is missing!'})
        
        # decode
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            print(data['username'])
        except:
            return jsonify({'Message': 'Invalid Token!'})

        return func(username=data['username'], *args, **kwargs)

    return decorated


def user_to_json(user):

    username, following, followers, profile_pic, date_joined, bio = user

    user_json = {
        'username': username,
        'following': following,
        'followers': followers,
        'profile_pic': profile_pic,
        'date_joined': date_joined,
        'bio': bio,
    }

    return user_json

def post_to_json(post):

    id, username, body, images, liked_by, date_posted, views, last_modified, likes = post

    post_json = {
        'id': id,
        'username': username,
        'body': body,
        'images': images,
        'liked_by': liked_by,
        'likes': likes,
        'views': views,
        'date_posted': date_posted,
        'last_modified': last_modified,
        
    }

    return post_json

def comment_to_json(comment):

    username, body, post_id, parent_id, comment_id, liked_by, date_created, date_modified, likes = comment

    comment_json = {
        'username': username,
        'body': body,
        'post_id': post_id,
        'parent_id': parent_id,
        'comment_id': comment_id,
        'liked_by': liked_by,
        'likes': likes,
        'date_created': date_created,
        'date_modified': date_modified,
    }

    return comment_json