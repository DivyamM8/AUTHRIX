import os
import sqlite3
import hashlib
from flask import render_template
from flask import Flask , request, jsonify, session, send_from_directory
from cryptography.fernet import Fernet
from werkzeug.utils import secure_filename
from flask_cors import CORS 

app =Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app)

DB_PATH = 'passwords.db'
MASTER_HASH_PATH = 'master.hash' 
KEY_PATH='secret.key'


def get_db():
    conn= sqlite3.connect(DB_PATH)
    conn.row_factory= sqlite3.Row
    return conn

def get_fernet():
    if not os.path.exists(KEY_PATH):
        key= Fernet.generate_key()
        with open(KEY_PATH, 'wb') as f :
            f.write(key)
    else:
        with open(KEY_PATH,'rb') as f:
            key = f.read()
    return Fernet(key)


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute('''
    CREATE TABLE IF NOT EXISTS passwords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform TEXT NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL
    )
    ''')

    conn.commit()
    conn.close()

init_db()
#API ENDPOINTS 

#--------------------------masterekey---
@app.route('/api/setup', methods =['POST'])
def setup_master():
    if os.path.exists(MASTER_HASH_PATH):
        return jsonify({'error ':' Mater password already set '}), 400 
    data = request.json
    password = data.get('password')
    if not password :
        return jsonify({'error' : 'Password required '}), 400
    with open(MASTER_HASH_PATH, 'w') as f :
        f.write(hash_password(password))
    return jsonify({'message' : 'Master password set '})

#--------------------login---

@app.route('/api/login', methods=['POST'])

def login() :
    if not os.path.exists(MASTER_HASH_PATH):
     return jsonify({'error' : 'Master password not set'}), 400 


    data = request.json 
    password= data.get('password')
    if not password:
        return jsonify({'error' : 'Password Required'}), 400 
    with open (MASTER_HASH_PATH, 'r') as f :
        stored_hash = f.read()

    if hash_password(password) == stored_hash:
        session['authenticated'] = True
        return jsonify({'message' : 'Login Successful !'}) 
    else:
        return jsonify({'error':'Login Failed.'})
    
#----------------------ADD-PASSWORDS---

@app.route('/api/passwords', methods=['POST'])

def add_password():
    if not session.get('authenticated'):
        return jsonify({'error':'Unauthorized'}), 401
    
    data = request.json 
    platform = data.get('platform')
    username = data.get('username')
    password = data.get('password')

    if not all([platform, username, password]):
        return jsonify({'error':'All fields required.'}), 400
    
    f = get_fernet()
    encrypted_pw= f.encrypt(password.encode()).decode()


    conn = get_db()
    c = conn.cursor()
    c.execute('INSERT INTO passwords (platform, username, password ) VALUES (?,?,?)', (platform, username, encrypted_pw))
    conn.commit()
    conn.close()
    return jsonify({'message':'Password Saved.'})


@app.route('/api/passwords', methods=['GET'])

def get_passwords():
    
    if not session.get('authenticated'):
        return jsonify({'error':'Unauthorized'}), 401 
    
    f = get_fernet()
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM password')
    rows = c.fetchall()
    conn.close()


    result = []
    for row in rows :
        decrypted_pw = f.decrypt(row['password'].encode()).decode()
        result.append({
            'id' : row['id'],
            'platform' : row['platform'],
            'username' : row['username'],
            'password' : decrypted_pw
            })
    return jsonify(result)


#------------------------DELETE PASSWORD ----

@app.route('/api/passwords/<int:pw_id>', methods=['DELETE'])


def delete_password(pw_id):
    if not session.get('authenticated'):
        return jsonify({'error':'Unauthorized'}), 401 
    
    conn = get_db()
    c = conn.cursor()
    c.execute('DELETE FROM passwords WHERE id = ?', (pw_id,))
    conn.commit()
    conn.close()
    return jsonify({'message':'Password deleted'})


#--------------------------FRONTEND PATH---
from flask import send_from_directory

@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True)

