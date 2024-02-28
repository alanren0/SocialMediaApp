from flask import Blueprint, request, jsonify, current_app
import bcrypt
import jwt
from datetime import datetime, timedelta
from db_connection import conn
from helpers import user_to_json


auth = Blueprint('auth', __name__)

cursor = conn.cursor()

@auth.route('/signin', methods=['POST'])
def signin():
    payload = request.json
    print(payload)

    # payload check
    if not payload.get('password') or not payload.get('username'):
        return jsonify({'message': 'Missing username or password'})

    try:
        # get and check password
        cursor.execute('SELECT password FROM credentials WHERE username=%s', [payload['username']])
        hashed_pw, = cursor.fetchone()

        if not hashed_pw:
            return jsonify({'message': 'User does not exist'})

        pw_good = bcrypt.checkpw(payload['password'].encode('utf-8'), hashed_pw)

        if not pw_good:
            return jsonify({'message': 'incorrect password'})
        
        # get user data
        cursor.execute('SELECT * FROM users WHERE username=%s', [payload['username']])
        
        user = user_to_json(cursor.fetchone())

        # create jwt token
        token = jwt.encode({
            'username': payload['username'],
            'expiration': str(datetime.utcnow() + timedelta(days=1))
        }, current_app.config['SECRET_KEY'])

        return jsonify({
            'token': token,
            'user': user
        })
    

    except Exception as e:
        conn.rollback()
        print(e)
        return jsonify({'message': 'something happened'})
    

@auth.route('/signup', methods=['POST'])
def signup():
    payload = request.json
    print(payload)

    # payload check
    if not payload.get('password') or not payload.get('username'):
        return jsonify({'message': 'Missing username or password'})

    # salt and hash password
    salt = bcrypt.gensalt()
    password = payload['password'].encode('utf-8')
    hashed = bcrypt.hashpw(password, salt)

    try:

        # add to credentials table
        cursor.execute('INSERT INTO credentials (username, password) VALUES (%s, %s)', (payload['username'], hashed))

        # add to user data table
        cursor.execute("INSERT INTO users (username) VALUES (%s)", [payload['username']])

        conn.commit()

        return jsonify({'message': 'user successfully created'})

    except Exception as e:
        print(e)
        conn.rollback()
        return jsonify({'message': 'something happened'})
    

    