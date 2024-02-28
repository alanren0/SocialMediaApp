from flask import Blueprint, request, jsonify
from helpers import token_required, user_to_json, logger
from db_connection import conn

users = Blueprint('users', __name__)

cursor = conn.cursor()

@users.route('/')
def get_users():
    return 'nothing'


@users.route('/follow', methods=['POST'])
@token_required
def follow_user(username):
    payload = request.json

    # payload check
    if not payload.get('toFollow'):
       return jsonify({'message': 'No user provided'})
    
    if username == payload['toFollow']:
       return jsonify({'message': 'Cannot follow your own user'})
    
    try:
        # check if already following
        cursor.execute('SELECT * FROM users WHERE username=%s AND %s=ANY(following)', [username, payload['toFollow']])
        if cursor.rowcount != 0:
            return jsonify({'message': 'Already following this user'})

        cursor.execute('SELECT username FROM users WHERE username=%s', [payload['toFollow']])

        if cursor.rowcount == 0:
           return jsonify({'message': 'The user you are trying to follow doesn\'t exist'})
        
        # add user
        cursor.execute("""
                        UPDATE users
                        SET following = ARRAY_APPEND(following, %s)
                        WHERE username=%s
                        RETURNING *
                        """,
                        [payload['toFollow'], username]
                    )

        user = user_to_json(cursor.fetchone())

        conn.commit()

        return jsonify({'user': user})

    except Exception as err:
       print(err)
       conn.rollback()
       return jsonify({'message': 'something happened'})

@users.route('/unfollow', methods=['POST'])
@token_required
def unfollow_user(username):
    payload = request.json

    # payload check
    if not payload.get('toUnfollow'):
       return jsonify({'message': 'No user provided'})
    
    try:
        # remove user
        cursor.execute("""
                        UPDATE users
                        SET following = ARRAY_REMOVE(following, %s)
                        WHERE username=%s
                        RETURNING *
                        """,
                        [payload['toUnfollow'], username]
                    )
       
        user = user_to_json(cursor.fetchone())

        conn.commit()

        return jsonify({'user': user})
       

    except Exception as err:
       print(err)
       conn.rollback()
       return jsonify({'message': 'something happened'})