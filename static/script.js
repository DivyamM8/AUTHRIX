// --- UI State ---
const loginSection = document.getElementById('login-section');
const setupSection = document.getElementById('setup-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const setupForm = document.getElementById('setup-form');
const addForm = document.getElementById('add-form');
const passwordTable = document.getElementById('password-table').querySelector('tbody');
const searchInput = document.getElementById('search-input');
const logoutBtn = document.getElementById('logout-btn');
const toggleDarkBtn = document.getElementById('toggle-dark');
const genBtn = document.getElementById('generate-btn');
const genLength = document.getElementById('gen-length');
const genOutput = document.getElementById('generated-password');
const copyGenBtn = document.getElementById('copy-gen-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

let deleteId = null;

// --- Helper Functions ---
function showSection(section) {
    [loginSection, setupSection, dashboardSection].forEach(s => s.style.display = 'none');
    section.style.display = '';
}
function showMessage(el, msg, isError = true) {
    el.textContent = msg;
    el.style.display = msg ? '' : 'none';
    el.className = isError ? 'text-danger mt-2' : 'text-success mt-2';
}
function passwordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
}
function strengthText(score) {
    return ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][score] || 'Very Weak';
}
function setDarkMode(on) {
    document.body.classList.toggle('dark-mode', on);
    localStorage.setItem('darkMode', on ? '1' : '0');
}
function getDarkMode() {
    return localStorage.getItem('darkMode') === '1';
}






// --- Initial State: Check if master password is set ---
fetch('/api/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({password: ''})})
    .then(r => r.json())
    .then(data => {
        if (data.error === 'Master password not set.') {
            showSection(setupSection);
        } else {
            showSection(loginSection);
        }
    });




// --- Setup Master Password ---
setupForm && setupForm.addEventListener('submit', e => {
    e.preventDefault();
    const pw = document.getElementById('setup-password').value;
    fetch('/api/setup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({password: pw})
    })
    .then(r => r.json())
    .then(data => {
        if (data.error) {
            showMessage(document.getElementById('setup-error'), data.error, true);
        } else {
            showMessage(document.getElementById('setup-error'), 'Master password set! Please login.', false);
            setTimeout(() => { showSection(loginSection); }, 1000);
        }
    });
});

document.getElementById('setup-password').addEventListener('input', e => {
    const score = passwordStrength(e.target.value);
    document.getElementById('setup-strength').textContent = 'Strength: ' + strengthText(score);
});

// 
// 
// 
// 
// 
// 
// --- Login ---
loginForm && loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const pw = document.getElementById('login-password').value;
    fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({password: pw})
    })
    .then(r => r.json())
    .then(data => {
        if (data.error) {
            showMessage(document.getElementById('login-error'), data.error, true);
        } else {
            showSection(dashboardSection);
            loadPasswords();
        }
    });
});

// --- Logout ---
logoutBtn && logoutBtn.addEventListener('click', () => {
    location.reload();
});

// --- Load Passwords ---
function loadPasswords() {
    fetch('/api/passwords')
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                showSection(loginSection);
                return;
            }
            renderPasswords(data);
        });
}
function renderPasswords(passwords) {
    passwordTable.innerHTML = '';
    passwords.forEach(entry => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${entry.platform}</td>
            <td>${entry.username}</td>
            <td>
                <div class="input-group input-group-sm">
                    <input type="password" class="form-control form-control-sm d-inline-block pw-field" value="${entry.password}" readonly style="width:120px;">
                    <button class="btn btn-outline-secondary btn-sm toggle-eye-btn" type="button" tabindex="-1"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-outline-secondary btn-sm ms-1 copy-btn" data-pw="${entry.password}">Copy</button>
                </div>
            </td>
            <td><button class="btn btn-danger btn-sm delete-btn" data-id="${entry.id}" data-bs-toggle="modal" data-bs-target="#deleteModal">Delete</button></td>
        `;
        passwordTable.appendChild(tr);
    });
}

// --- Add Password ---
addForm && addForm.addEventListener('submit', e => {
    e.preventDefault();
    const platform = document.getElementById('add-platform').value;
    const username = document.getElementById('add-username').value;
    const password = document.getElementById('add-password').value;
    fetch('/api/passwords', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({platform, username, password})
    })
    .then(r => r.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            loadPasswords();
            document.getElementById('add-form').reset();
            document.getElementById('add-strength').textContent = '';
            bootstrap.Modal.getInstance(document.getElementById('addModal')).hide();
        }
    });
});

document.getElementById('add-password').addEventListener('input', e => {
    const score = passwordStrength(e.target.value);
    document.getElementById('add-strength').textContent = 'Strength: ' + strengthText(score);
});

// --- Delete Password ---
passwordTable.addEventListener('click', e => {
    if (e.target.classList.contains('delete-btn')) {
        deleteId = e.target.getAttribute('data-id');
    }
    if (e.target.classList.contains('copy-btn')) {
        const pw = e.target.getAttribute('data-pw');
        navigator.clipboard.writeText(pw);
        e.target.textContent = 'Copied!';
        setTimeout(() => { e.target.textContent = 'Copy'; }, 1000);
    }
    if (e.target.closest('.toggle-eye-btn')) {
        const btn = e.target.closest('.toggle-eye-btn');
        const input = btn.parentElement.querySelector('.pw-field');
        const icon = btn.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        }
    }
});
confirmDeleteBtn && confirmDeleteBtn.addEventListener('click', () => {
    if (!deleteId) return;
    fetch(`/api/passwords/${deleteId}`, {method: 'DELETE'})
        .then(r => r.json())
        .then(data => {
            loadPasswords();
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
        });
});

// --- Search/Filter ---
searchInput && searchInput.addEventListener('input', e => {
    const val = e.target.value.toLowerCase();
    Array.from(passwordTable.children).forEach(tr => {
        const platform = tr.children[0].textContent.toLowerCase();
        const username = tr.children[1].textContent.toLowerCase();
        tr.style.display = (platform.includes(val) || username.includes(val)) ? '' : 'none';
    });
});

// --- Password Generator ---
function generatePassword(len) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let pw = '';
    for (let i = 0; i < len; i++) {
        pw += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pw;
}
genBtn && genBtn.addEventListener('click', () => {
    const len = parseInt(genLength.value) || 12;
    const pw = generatePassword(len);
    genOutput.value = pw;
});
copyGenBtn && copyGenBtn.addEventListener('click', () => {
    if (genOutput.value) {
        navigator.clipboard.writeText(genOutput.value);
        copyGenBtn.textContent = 'Copied!';
        setTimeout(() => { copyGenBtn.textContent = 'Copy'; }, 1000);
    }
});

// --- Dark Mode ---
toggleDarkBtn && toggleDarkBtn.addEventListener('click', () => {
    setDarkMode(!getDarkMode());
});
window.addEventListener('DOMContentLoaded', () => {
    setDarkMode(getDarkMode());
}); 