from flask import Blueprint, request, jsonify
from helpers import token_required, comment_to_json, logger
from db_connection import conn

comments = Blueprint('comments', __name__)

cursor = conn.cursor()

# optional: sortBy, reverse, offset, limit, dateLimit, user, postId
@comments.route('/')
def get_comments():
    sort_by = request.args.get('sortBy')
    reverse = request.args.get('reverse')
    offset = request.args.get('offset')
    limit = request.args.get('limit')
    date_limit = request.args.get('dateLimit')
    username = request.args.get('username')
    post_id = request.args.get('postId')

    # allowed options
    sort_by_options = ('likes', 'date_posted')
    date_limit_options = ('24 hours', '72 hours', '168 hours')

    # build query
    sql = 'SELECT * FROM comments '
    params = {}

    isAnd = False
    # user option
    if username:
        sql = sql + 'WHERE username=%(username)s '
        params['username'] = username
        isAnd = True

    # post id option
    if post_id:
        if isAnd:
            sql = sql + 'AND '
        else:
            sql = sql + 'WHERE '
        sql = sql + 'post_id=%(post_id)s '
        params['post_id'] = post_id
        isAnd = True

    # date option
    if date_limit and date_limit.lower() in date_limit_options:
        if isAnd:
            sql = sql + 'AND '
        else:
            sql = sql + 'WHERE '
        sql = sql + 'date_created > now() - interval %(date_limit)s '
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

        comments = cursor.fetchall()

        res = []
        for comment in comments:
            res.append(comment_to_json(comment))

        return jsonify({'comments': res})

    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return jsonify({'message': 'something unexpected happened'})

# required: body, postId
@comments.route('/create', methods=['POST'])
@token_required
def create_comment(username):
    payload = request.json

    if not payload.get('body') or not payload.get('postId'):
        return jsonify({'message': 'comment body and post id required'})
    
    try:
        cursor.execute('INSERT INTO comments (username, body, post_id) VALUES (%s, %s, %s) RETURNING *', [username, payload['body'], payload['postId']])

        comment = comment_to_json(cursor.fetchone())

        conn.commit()
        return jsonify({'comment': comment})

    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return ({'message': 'something unexpected happened'})
    
# required body, commentId
@comments.route('/edit', methods=['PATCH'])
@token_required
def edit_comment(username):
    payload = request.json

    if not payload.get('commentId'):
        return jsonify({'message': 'comment id missing'})
    
    if not payload.get('body'):
        return jsonify({'message': 'no changes to be made'})
    
    try:
        cursor.execute("""
                       UPDATE comments 
                       SET body=%s, date_modified=NOW() 
                       WHERE username=%s AND comment_id=%s 
                       RETURNING *
                       """, 
                       [payload['body'], username, payload['commentId']]
                    )

        if cursor.rowcount != 1:
            logger.debug('affected rows equal to {}, expected 1'.format(cursor.rowcount)) 
            return jsonify({'message': 'something unexpected happened'})
       
        comment = comment_to_json(cursor.fetchone())

        conn.commit()
        return jsonify({'comment': comment})

    except Exception as err:
       logger.debug(err)
       conn.rollback()
       return jsonify({'message': 'something unexpected happened'})

# required: commentId
@comments.route('/delete', methods=['DELETE'])
@token_required
def delete_comment(username):
    payload = request.json

    if not payload.get('commentId'):
        return jsonify({'message': 'comment id required'})
    
    try:
        cursor.execute('DELETE FROM comments WHERE username=%s AND comment_id=%s', [username, payload['commentId']])
        if cursor.rowcount != 1:
           return jsonify({'message': 'comment id doesn\'t exist or comment doesn\'t belong to user'})
        
        conn.commit()
        return jsonify({'message': 'comment successfully deleted'})

    except Exception as err:
        print(err)
        conn.rollback()
        return jsonify({'message': 'something happened'})


# required: commentId
@comments.route('/like', methods=['PATCH'])
@token_required
def like_comment(username):
    payload = request.json

    if not payload.get('commentId'):
        return jsonify({'message': 'comment id required'})
    
    try:
        # check if already liked
        cursor.execute('SELECT * FROM comments WHERE comment_id=%s AND %s=ANY(liked_by)', [payload['commentId'], username])

        sql = 'UPDATE comments SET liked_by = ARRAY_APPEND(liked_by, %s) WHERE comment_id=%s RETURNING *'

        # remove if user already liked comment
        if cursor.rowcount == 1:
            sql = 'UPDATE comments SET liked_by = ARRAY_REMOVE(liked_by, %s) WHERE comment_id=%s RETURNING *'

        cursor.execute(sql, [username, payload['commentId']])

        if cursor.rowcount != 1:
            logger.debug('affected rows equal to {}, expected 1'.format(cursor.rowcount))
            return jsonify({'message': 'something unexpected happened'})
        

        comment = comment_to_json(cursor.fetchone())

        conn.commit()
        return jsonify({'comment': comment})

    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return jsonify({'message': 'something unexpected happened'})


