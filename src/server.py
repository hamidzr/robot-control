import os
from flask import Flask, render_template, Response
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'secret')
socketio = SocketIO(app)


def root_dir():
    return os.path.abspath(os.path.dirname(__file__))

def get_file(filename):
    try:
        src = os.path.join(root_dir(), filename)
        return open(src).read()
    except IOError as exc:
        return str(exc)

@app.route('/')
def index():
    return Response(get_file('../public/index.html'), mimetype="text/html")
    return render_template('index.html')

@app.route('/main.js')
def mainjs():
    return Response(get_file('../public/main.js'), mimetype="text/html")
    return render_template('index.html')

@socketio.on('submission')
def test_message(message):
    print('got', message)
    emit('my response', {'data': 'got it!'})

if __name__ == '__main__':
    socketio.run(app)
