from flask import Blueprint, request, jsonify
from helpers import token_required, post_to_json, logger
from db_connection import conn

posts = Blueprint('posts', __name__)

cursor = conn.cursor()

# optional: sortBy, reverse, offset, limit, dateLimit, user
@posts.route('/', methods=['GET'])
def get_posts():
    sort_by = request.args.get('sortBy')
    reverse = request.args.get('reverse')
    offset = request.args.get('offset')
    limit = request.args.get('limit')
    date_limit = request.args.get('dateLimit')
    username = request.args.get('username')

    # allowed options
    sort_by_options = ('likes', 'views', 'date_posted')
    date_limit_options = ('24 hours', '72 hours', '168 hours')

    # build query
    sql = 'SELECT * FROM posts '
    params = {}

    # user option
    if username:
        sql = sql + 'WHERE username=%(username)s '
        params['username'] = username

    # date option
    if date_limit and date_limit.lower() in date_limit_options:
        if username:
            sql = sql + 'AND date_posted > now() - interval %(date_limit)s '
        else:
            sql = sql + 'WHERE date_posted > now() - interval %(date_limit)s '
        params['date_limit'] = date_limit

    # order option
    order = 'DESC'
    if reverse and reverse.lower() == 'true':
        order = 'ASC'

    # sort option
    if sort_by and sort_by.lower() in sort_by_options:
        sql = sql + 'ORDER BY %(sort_by)s %(order)s '
        params['sort_by'] = sort_by
        params['order'] = order

    # offset option
    if offset:
        sql = sql + 'OFFSET %(offset)s '
        params['offset'] = offset

    # limit option
    if limit and limit.isdigit() and int(limit) <= 20:
        sql = sql + 'LIMIT %(limit)s '
        params['limit'] = limit
    # default limit 20
    else: 
        sql = sql + 'LIMIT 20 '
        
    try:
        cursor.execute(sql, params)

        posts = cursor.fetchall()

        res = []
        for post in posts:
            res.append(post_to_json(post))

        return jsonify({'posts': res})

    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return jsonify({'message': 'something unexpected happened'})

# required: id, body, 
# optional: images
@posts.route('/create', methods=['POST'])
@token_required
def create_post(username):
    payload = request.json

    # payload check
    if not payload.get('body'):
       return jsonify({'message': 'post body required'})
    
    # optional
    images = []
    if payload.get('images') and isinstance(payload['images'], list):
       images = payload['images']
    
    try:
        # create post
        cursor.execute('INSERT INTO posts (username, body, images) VALUES (%s, %s, %s) RETURNING *', [username, payload['body'], images])
        
        post = post_to_json(cursor.fetchone())

        conn.commit()
        return jsonify({'post': post})

    except Exception as err:
       print(err)
       conn.rollback()
       return jsonify({'message': 'something happened'})

# required: id
@posts.route('/delete', methods=['DELETE'])
@token_required
def delete_post(username):
    payload = request.json

    if not payload.get('id'):
        return jsonify({'message': 'post id required'})
    
    try:
        cursor.execute('DELETE FROM posts WHERE username=%s AND id=%s', [username, payload['id']])
        if cursor.rowcount != 1:
           return jsonify({'message': 'id doesn\'t exist or post doesn\'t belong to user'})
        
        conn.commit()
        return jsonify({'message': 'post successfully deleted'})

    except Exception as err:
        print(err)
        conn.rollback()
        return jsonify({'message': 'something happened'})
        
# required: id, one of body/images 
@posts.route('/edit', methods=['PATCH'])
@token_required
def edit_post(username):
    payload = request.json

    if not payload.get('id'):
        return jsonify({'message': 'id missing'})
    
    if not payload.get('body') and not payload.get('images'):
        return jsonify({'message': 'no changes to be made'})
    
    # construct sql
    sql = 'UPDATE posts SET '
    params = []
    if payload.get('body'):
       sql = sql + 'body=%s, '
       params.append(payload['body'])

    if payload.get('images'):
       sql = sql + 'images=%s, '
       params.append(payload['images'])

    sql = sql + 'last_modified=NOW() '
    sql = sql + 'WHERE username=%s AND id=%s RETURNING *'
    params.append(username)
    params.append(payload['id'])

    try:
        cursor.execute(sql, params)
        if cursor.rowcount != 1:
            logger.debug('affected rows not equal to 1') 
            return jsonify({'message': 'something unexpected happened'})
       
        post = post_to_json(cursor.fetchone())

        conn.commit()
        return jsonify({'post': post})

    except Exception as err:
       logger.debug(err)
       conn.rollback()
       return jsonify({'message': 'something unexpected happened'})
    
# required: id
@posts.route('/like', methods=['PATCH'])
@token_required
def like_post(username):
    payload = request.json

    if not payload.get('id'):
        return jsonify({'message': 'post id required'})
    
    try:
        # check if already liked
        cursor.execute('SELECT * FROM posts WHERE id=%s AND %s=ANY(liked_by)', [payload['id'], username])

        sql = 'UPDATE posts SET liked_by = ARRAY_APPEND(liked_by, %s) WHERE id=%s RETURNING *'

        # remove if user already liked post
        if cursor.rowcount == 1:
            sql = 'UPDATE posts SET liked_by = ARRAY_REMOVE(liked_by, %s) WHERE id=%s RETURNING *'

        cursor.execute(sql, [username, payload['id']])

        if cursor.rowcount != 1:
            logger.debug('number of affected rows not equal to 1')
            return jsonify({'message': 'something unexpected happened'})
        

        post = post_to_json(cursor.fetchone())

        conn.commit()
        return jsonify({'post': post})

    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return jsonify({'message': 'something unexpected happened'})
