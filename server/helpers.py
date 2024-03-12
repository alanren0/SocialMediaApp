from functools import wraps
import jwt
from flask import request, jsonify
from flask import current_app
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
FORMAT = "[%(filename)s:%(lineno)s - %(funcName)20s() ] %(message)s"
logging.basicConfig(format=FORMAT)
logger.setLevel(logging.DEBUG)


def token_required(func):
    @wraps(func)
    def decorated(*args, **kwargs):
        token = None

        # get token
        if "Authorization" in request.headers:
            if len(request.headers["Authorization"].split(" ")) < 2:
                return jsonify({'Message': 'Token is missing!'}), 400

            token = request.headers["Authorization"].split(" ")[1]

        # no token
        if not token:
            return jsonify({'Message': 'Token is missing!'}), 400
        
        # decode
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])

            if datetime.strptime(data['expiration'], '%Y-%m-%d %H:%M:%S.%f') < datetime.utcnow():
                return jsonify({'Message': 'Token Expired!'}), 400

        except Exception as err:
            logger.debug(err)
            return jsonify({'Message': 'Invalid Token!'}), 400

        return func(username=data['username'], *args, **kwargs)

    return decorated


def user_to_json(user):

    username, following, profile_pic, date_joined, bio, alias, followers = user

    str_image = None
    if profile_pic:
        str_image = profile_pic.decode('utf-8')

    user_json = {
        'username': username,
        'following': following,
        'followers': followers,
        'profile_pic': str_image,
        'date_joined': date_joined,
        'bio': bio,
        'alias': alias,
    }

    return user_json

def post_to_json(post):

    id, username, body, images, liked_by, date_posted, views, last_modified, likes, share_id = post

    str_images = []
    if not images:
        images = []
        
    for image in images:
        str_images.append(image.decode('utf-8'))

    post_json = {
        'id': id,
        'username': username,
        'body': body,
        'images': str_images,
        'liked_by': liked_by,
        'likes': likes,
        'views': views,
        'date_posted': date_posted,
        'last_modified': last_modified,
        'share_id': share_id
        
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