# Authrix Password Manager

A secure, user-friendly password manager web app built with Flask (Python), SQLite, and Bootstrap.

## Features
- Master password protection (SHA-256 hashed)
- Passwords encrypted with cryptography.fernet
- Add, view, search, and delete password entries
- Password generator & strength meter
- Responsive, modern UI with dark mode
- All data stored locally (no cloud)

## Setup & Run
1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Run the app:**
   ```bash
   python app.py
   ```
3. **Open in browser:**
   Visit [http://127.0.0.1:5000]

## Security Notes
- Master password is never stored in plain text (SHA-256 hash only)
- Passwords are encrypted at rest using Fernet symmetric encryption
- All operations are local; no data leaves your machine
- For best security, use a strong master password and keep your device safe

