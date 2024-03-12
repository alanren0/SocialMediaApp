from flask import Blueprint, request, jsonify
from helpers import token_required, post_to_json, user_to_json, logger
from db_connection import conn

posts = Blueprint('posts', __name__)

cursor = conn.cursor()


@posts.route('/getOne/<id>', methods=['GET'])
def get_one(id):
    try:
        cursor.execute('UPDATE posts SET views = views + 1 WHERE id=%s RETURNING *', [id])

        if cursor.rowcount != 1:
            logger.debug('Affected rows {}, expected 1'.format(cursor.rowcount))
            return jsonify({'message': 'something unexpected happened'})

        post = post_to_json(cursor.fetchone())

        return jsonify({'post': post})


    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return jsonify({'message': 'something unexpected happened'}), 500



# optional: sortBy, reverse, offset, limit, dateLimit, username, returnUser
@posts.route('/', methods=['GET'])
def get_posts():
    sort_by = request.args.get('sortBy')
    reverse = request.args.get('reverse')
    offset = request.args.get('offset')
    limit = request.args.get('limit')
    date_limit = request.args.get('dateLimit')
    username = request.args.get('username')
    return_user = request.args.get('returnUser')

    # allowed options
    sort_by_options = ('likes', 'views', 'date_posted')
    date_limit_options = ('24h', '72h', '1w')

    # build query
    sql = 'SELECT * FROM posts '
    params = {}

    if return_user and return_user.lower() == 'true':
        sql = sql + 'LEFT JOIN users ON posts.username = users.username '

    # user option
    if username:
        sql = sql + 'WHERE posts.username=%(username)s '
        params['username'] = username

    # date option
    if date_limit and date_limit.lower() in date_limit_options:

        option = '24 HOURS'
        if date_limit == '72h':
            option = '72 HOURS'
        elif date_limit == '1w':
            option = '168 HOURS'

        if username:
            sql = sql + 'AND date_posted > now() - interval \'{}\' '.format(option)
        else:
            sql = sql + 'WHERE date_posted > now() - interval \'{}\' '.format(option)
        # params['date_limit'] = option

    # order option
    order = 'DESC '
    if reverse and reverse.lower() == 'true':
        order = 'ASC '

    # sort option
    if sort_by and sort_by.lower() in sort_by_options:
        sql = sql + 'ORDER BY {} {} '.format(sort_by, order)
        # params['sort_by'] = sort_by

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
        conn.commit()

        posts = cursor.fetchall()
        res = []
        for post in posts:
            temp = {'post': post_to_json(post[0:10])}
            if return_user:
                temp['user'] = user_to_json(post[10:17])
            res.append(temp)

            


        return jsonify({'posts': res})

    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return jsonify({'message': 'something unexpected happened'})

# required: body, 
# optional: images
# optional: shareId
@posts.route('/create', methods=['POST'])
@token_required
def create_post(username):
    payload = request.json

    # payload check
    if not payload.get('body'):
       return jsonify({'message': 'post body required'}), 400
    
    # optional
    images = []
    if payload.get('images') and isinstance(payload['images'], list):
       images = payload['images']
    
    try:
        # create post
        cursor.execute('INSERT INTO posts (username, body, images) VALUES (%s, %s, %s) RETURNING *', [username, payload['body'], images])
        
        post = post_to_json(cursor.fetchone())

        conn.commit()
        return jsonify({'post': post}), 200

    except Exception as err:
       logger.debug(err)
       conn.rollback()
       return jsonify({'message': 'something happened'}), 500

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
        logger.debug(err)
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
        return jsonify({'message': 'post id required'}), 400
    
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
            return jsonify({'message': 'something unexpected happened'}), 500
        

        post = post_to_json(cursor.fetchone())

        conn.commit()
        return jsonify({'post': post})

    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return jsonify({'message': 'something unexpected happened'}), 500

# optional offset, limit, returnUser
@posts.route('/likedBy/<username>', methods=['GET'])
def get_liked_by_posts(username):
    offset = request.args.get('offset')
    limit = request.args.get('limit')
    return_user = request.args.get('returnUser')

    # build query
    sql = 'SELECT * FROM posts '
    params = {'username': username}

    if return_user and return_user.lower() == 'true':
        sql = sql + 'LEFT JOIN users ON posts.username = users.username '

    sql = sql + 'WHERE %(username)s=ANY(liked_by) '

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
            temp = {'post': post_to_json(post[0:10])}
            if return_user:
                temp['user'] = user_to_json(post[10:17])
            res.append(temp)

        return jsonify({'posts': res}), 200

    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return jsonify({'message': 'something unexpected happened'}), 500


@posts.route('/custom')
@token_required
def get_custom_feed(username):
    sort_by = request.args.get('sortBy')
    reverse = request.args.get('reverse')
    date_limit = request.args.get('dateLimit')
    offset = request.args.get('offset')
    limit = request.args.get('limit')
    return_user = request.args.get('returnUser')

    # allowed options
    sort_by_options = ('likes', 'views', 'date_posted')
    date_limit_options = ('24h', '72h', '1w')

    # build query
    sql = 'SELECT * FROM posts '
    params = {'username': username}

    if return_user and return_user.lower() == 'true':
        sql = sql + 'LEFT JOIN users ON posts.username = users.username '

    sql = sql + 'WHERE posts.username=ANY(ARRAY(SELECT following FROM users WHERE username=%(username)s)) '

    # date option
    if date_limit and date_limit.lower() in date_limit_options:

        option = '24 HOURS'
        if date_limit == '72h':
            option = '72 HOURS'
        elif date_limit == '1w':
            option = '168 HOURS'

        sql = sql + 'AND date_posted > now() - interval \'{}\' '.format(option)
        # params['date_limit'] = option

    # order option
    order = 'DESC '
    if reverse and reverse.lower() == 'true':
        order = 'ASC '

    # sort option
    if sort_by and sort_by.lower() in sort_by_options:
        sql = sql + 'ORDER BY {} {} '.format(sort_by, order)
        # params['sort_by'] = sort_by

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
            temp = {'post': post_to_json(post[0:10])}
            if return_user:
                temp['user'] = user_to_json(post[10:17])
            res.append(temp)

        return jsonify({'posts': res}), 200

    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return jsonify({'message': 'something unexpected happened'}), 500