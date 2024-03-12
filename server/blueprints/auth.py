from flask import Blueprint, request, jsonify, current_app
import bcrypt
import jwt
from datetime import datetime, timedelta
from db_connection import conn
from helpers import user_to_json, logger


auth = Blueprint('auth', __name__)

cursor = conn.cursor()

# required: username, password
@auth.route('/signin', methods=['POST'])
def signin():
    payload = request.json

    # payload check
    if not payload.get('password') or not payload.get('username'):
        return jsonify({'message': 'Missing username or password'}), 400

    try:
        # get and check password
        cursor.execute('SELECT password FROM credentials WHERE username=%s', [payload['username']])
        if cursor.rowcount == 0:
            return jsonify({'message': 'incorrect username and password'}), 400

        hashed_pw, = cursor.fetchone()
        pw_check = bcrypt.checkpw(payload['password'].encode('utf-8'), hashed_pw)

        if not pw_check:
            return jsonify({'message': 'incorrect username and password'}), 400
        
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
        }), 200
    
    except Exception as err:
        conn.rollback()
        logger.debug(err)
        return jsonify({'message': 'something happened'}), 500
    

@auth.route('/signup', methods=['POST'])
def signup():
    payload = request.json

    # payload check
    if not payload.get('password') or not payload.get('username'):
        return jsonify({'message': 'Missing username or password'}), 400

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

        return jsonify({'message': 'user successfully created'}), 201

    except Exception as err:
        logger.debug(err)
        conn.rollback()
        return jsonify({'message': 'something happened'}), 500
    

    