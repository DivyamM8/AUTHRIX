import os
import sqlite3
import hashlib
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

def get_feret():
    if not os.path.exists(KEY_PATH):
        key= Fernet.generate_key()
        with open(KEY_PATH, 'wb') as f :
            f.write(key)
    else:
        with open(KEY_PATH,'wb') as f:
            key = f.read()
    return Fernet(key)


def hash_pasword(password):
    return hashlib.sha256(password.encode()).hexdigest()

def init_db():
    conn = get_db()
    c = conn.cursor
    c.execute(''' CREATE TABLE IF NOT EXISTS password(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              platform TEXT NOT NULL,
              username TEXT NOT NULL,
              password TEXT NOT NULL,
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
    passowrd = data.get('password')
    if not password :
        return jsonify({'error' : 'Password required '}), 400
    with open(MASTER_HASH_PATH, 'w') as f :
        f.write(hash_pasword(password))
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