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
