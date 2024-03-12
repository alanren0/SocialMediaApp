from flask import Blueprint, request, jsonify
from helpers import token_required, comment_to_json, user_to_json, logger
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
    return_user = request.args.get('returnUser')
    

    # allowed options
    sort_by_options = ('likes', 'date_posted')
    date_limit_options = ('24 hours', '72 hours', '168 hours')

    # build query
    sql = 'SELECT * FROM comments '
    params = {}

    if return_user and return_user.lower() == 'true':
        sql = sql + 'LEFT JOIN users ON comments.username = users.username '

    isAnd = False
    # user option
    if username:
        sql = sql + 'WHERE users.username=%(username)s '
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
            temp = {'comment': comment_to_json(comment[0:9])}
            if return_user:
                temp['user'] = user_to_json(comment[9:16])
            res.append(temp)

        return jsonify({'comments': res}), 200

    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return jsonify({'message': 'something unexpected happened'}), 500

# required: body, postId
# optional: parentId
@comments.route('/create', methods=['POST'])
@token_required
def create_comment(username):
    payload = request.json

    if not payload.get('body') or not payload.get('postId'):
        return jsonify({'message': 'comment body and post id required'}), 400
    
    try:
        sql = 'INSERT INTO comments '
        columns = ['username', 'body', 'post_id']
        values = ['%(username)s', '%(body)s', '%(post_id)s']
        params = {
            'username': username,
            'body': payload['body'],
            'post_id': payload['postId']
        }

        if payload.get('parentId'):
            columns.append('parent_id')
            values.append('%(parent_id)s')
            params['parent_id'] = payload['parentId']

        sql = '{} ({}) VALUES ({}) RETURNING *'.format(sql, ', '.join(columns), ', '.join(values))
        
        cursor.execute(sql, params)

        comment = comment_to_json(cursor.fetchone())

        conn.commit()
        return jsonify({'comment': comment}), 200

    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return ({'message': 'something unexpected happened'}), 500
    
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
            return jsonify({'message': 'something unexpected happened'}), 500
       
        comment = comment_to_json(cursor.fetchone())

        conn.commit()
        return jsonify({'comment': comment}), 200

    except Exception as err:
       logger.debug(err)
       conn.rollback()
       return jsonify({'message': 'something unexpected happened'}), 500

# required: commentId
@comments.route('/delete', methods=['DELETE'])
@token_required
def delete_comment(username):
    payload = request.json

    if not payload.get('commentId'):
        return jsonify({'message': 'comment id required'}), 400
    
    try:
        cursor.execute('DELETE FROM comments WHERE username=%s AND comment_id=%s', [username, payload['commentId']])
        if cursor.rowcount != 1:
           return jsonify({'message': 'comment id doesn\'t exist or comment doesn\'t belong to user'}), 400
        
        conn.commit()
        return jsonify({'message': 'comment successfully deleted'}), 200

    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return jsonify({'message': 'something happened'}), 500


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
            return jsonify({'message': 'something unexpected happened'}), 500
        

        comment = comment_to_json(cursor.fetchone())

        conn.commit()
        return jsonify({'comment': comment}), 200

    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return jsonify({'message': 'something unexpected happened'}), 500


