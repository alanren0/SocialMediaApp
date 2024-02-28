import os
from flask import Flask
from blueprints.posts import posts
from blueprints.comments import comments
from blueprints.users import users
from blueprints.auth import auth

from helpers import token_required

app = Flask(__name__)
app.register_blueprint(posts, url_prefix='/posts')
app.register_blueprint(comments, url_prefix='/comments')
app.register_blueprint(users, url_prefix='/users')
app.register_blueprint(auth, url_prefix='/auth')

SECRET_KEY = os.environ.get('SECRET_KEY')
app.config['SECRET_KEY'] = SECRET_KEY

@app.route("/")
def index():
    return "Hello World"

@app.route('/test')
@token_required
def auth():
    return 'authed'


app.run(host="0.0.0.0", port=3001, debug=True)

