from flask import Blueprint, request, jsonify
from helpers import token_required, user_to_json, logger
from db_connection import conn

users = Blueprint('users', __name__)

cursor = conn.cursor()

@users.route('/getOne/<username>', methods=['GET'])
def get_one(username):
    try:
        cursor.execute('SELECT * FROM users WHERE username=%s', [username])

        if cursor.rowcount != 1:
            logger.debug('Affected rows {}, expected 1'.format(cursor.rowcount))
            return jsonify({'message': 'something unexpected happened'}), 400

        user = user_to_json(cursor.fetchone())

        return jsonify({'user': user})


    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return jsonify({'message': 'something unexpected happened'}), 500

@users.route('/')
def get_users():
    return 'nothing'


@users.route('/follow', methods=['PATCH'])
@token_required
def follow_user(username):
    payload = request.json

    # payload check
    if not payload.get('toFollow'):
       return jsonify({'message': 'No user provided'}), 400
    
    if username == payload['toFollow']:
       return jsonify({'message': 'Cannot follow your own user'}), 400
    
    try:
        # check if user exists
        cursor.execute('SELECT username FROM users WHERE username=%s', [payload['toFollow']])

        if cursor.rowcount == 0:
           return jsonify({'message': 'The user you are trying to follow doesn\'t exist'})

        # create query
        sql = 'UPDATE users SET following = ARRAY_APPEND(following, %s) WHERE username=%s RETURNING *' # update user
        sql2 = 'UPDATE users SET followers = ARRAY_APPEND(followers, %s) WHERE username=%s RETURNING *' # update user being followed

        # check if already following
        cursor.execute('SELECT * FROM users WHERE username=%s AND %s=ANY(following)', [username, payload['toFollow']])

        # remove if already following
        if cursor.rowcount != 0:
            sql = 'UPDATE users SET following = ARRAY_REMOVE(following, %s) WHERE username=%s RETURNING *'
            sql2 = 'UPDATE users SET followers = ARRAY_REMOVE(followers, %s) WHERE username=%s RETURNING *'

        # execute
        cursor.execute(sql, [payload['toFollow'], username])
        user = user_to_json(cursor.fetchone())

        cursor.execute(sql2, [username, payload['toFollow']])
        followedUser = user_to_json(cursor.fetchone())

        conn.commit()
        return jsonify({'user': user, 'followedUser': followedUser})

    except Exception as err:
       logger.debug(err)
       conn.rollback()
       return jsonify({'message': 'something happened'}), 500


# body: one or more of alias, bio, profilePic
@users.route('/edit', methods=['PATCH'])
@token_required
def edit_user(username):
    payload = request.json

    if not payload.get('alias') and not payload.get('bio') and not payload.get('profilePic'):
        return jsonify({'Message': 'alias, bio, or profilePic required in body'}), 400
    
    sql = 'UPDATE users SET '
    params = {}
    updates = []

    if payload.get('alias'):
        updates.append('alias=%(alias)s ')
        params['alias'] = payload['alias']

    if payload.get('bio'):
        updates.append('bio=%(bio)s ')
        params['bio'] = payload['bio']

    if payload.get('profilePic'):
        updates.append('profile_pic=%(profile_pic)s ')
        params['profile_pic'] = payload['profilePic']

    sql = sql + ', '.join(updates)

    sql = sql + 'WHERE username=%(username)s RETURNING *'
    params['username'] = username

    try:
        cursor.execute(sql, params)
        if cursor.rowcount != 1:
            logger.debug('affected rows not equal to 1') 
            return jsonify({'message': 'something unexpected happened'}), 500

        user = user_to_json(cursor.fetchone())
        conn.commit()
        return jsonify({'user': user})

    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return jsonify({'Message': 'Something unexpected happened'}), 500

        
@users.route('/following', methods=['GET'])
@token_required
def get_following(username):
    try:

        cursor.execute('SELECT cardinality(following) FROM users WHERE username=%s', [username])
        count, = cursor.fetchone()
        if count == 0:
            return jsonify({'users': []}), 200

        cursor.execute("""
                        SELECT * 
                        FROM users
                        WHERE username = ANY(ARRAY(
                            SELECT following 
                            FROM users
                            WHERE username=%s
                        ))
                        """,
                        [username]
        )
        
        users = cursor.fetchall()

        res = []
        for user in users:
            res.append(user_to_json(user))

        return jsonify({'users': res})
        
    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return jsonify({'Message': 'Something unexpected happened'}), 500
    
@users.route('/popular')
def get_popular():
    try:
        cursor.execute('SELECT * FROM users ORDER BY cardinality(followers) DESC LIMIT 10')

        users = cursor.fetchall()

        res = []
        for user in users:
            res.append(user_to_json(user))

        return jsonify({'users': res})

    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return jsonify({'message': 'something unexpected happened'}), 500