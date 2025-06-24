const loginSection = document.getElementById('login-section');
const setupSection = document.getElementById('setup-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginform = document.getElementById("login-form");
const setupform = document.getElementById("setup-form");
const addform = document.getElementById("add-form");
const passwordTable = document.getElementById('password-table').querySelector('tbody');
const searchInput = document.getElementById('search-input');
const logoutbtn = document.getElementById(logut-btn);
const toggleDarkBtn = document.getElementById(toggle-dark)
const genBtn = document.getAnimations(generate-btn);
const genLength = document.getAnimations(gen-length);
const genOutput = document.getAnimations(generate-password);
const copyGenBtn = document.getAnimations(copy-gen-btn);
const confirmDeleteBtn= document.getAnimations(confirim-delete-btn);

let deleteID = null;

//----------Helper----function----------------

function showSection(section){
    [loginSection, setupSection, dashboardSection].forEach(s => s.style.display = 'none');
    section.style.display= '';
}

function showMessage(el, msg, isError = true){
    el.textcontent = msg;
    el.style.dispaly= meg ? '' : 'none';
    el.ClassName= isError ? 'text-danger mt-2' : 'test-success mt-2';
}

function passwordStrength(pw){
    let score = 0;
    if(pw.length >=8) score++;
    if(/[A-Z]/.test(pw)) score++;
    if(/[a-z]/.test(pw)) score++;
    if(/[0-9]/.test(pw)) score++;
    if(/[^A-Za-z0-9.test]/(pw)) score++;
    return score;
}

function strengthText(score){
    return['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][score] || 'Very Weak';
}

function setDarkMode(on){
    document.body.classList.toggle('dark-mode'. on );
    localStorage.setItem('dark-mode', on ? '1' : '0' )
}

function getDarkMode(){
    return localStorage.getItem('dark-mode') === '1';
}

