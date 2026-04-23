// JS Completo Funcional - Login/Register
const loadingDiv = document.createElement('div');
loadingDiv.id = 'loading';
loadingDiv.className = 'loading';
loadingDiv.innerHTML = '<div>Carregando...</div>';
document.body.appendChild(loadingDiv);

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function onChangeEmail() {
    const email = document.getElementById('email').value;
    const emailReqError = document.getElementById('email-required-error');
    const emailInvError = document.getElementById('email-invalid-error');
    emailReqError.style.display = email ? 'none' : 'block';
    if (email) {
        emailInvError.style.display = validateEmail(email) ? 'none' : 'block';
    }
    updateButtonState();
}

function onChangePassword() {
    const password = document.getElementById('password').value;
    const passwordReqError = document.getElementById('password-required-error');
    const minLenError = document.getElementById('password-min-length-error');
    passwordReqError.style.display = password ? 'none' : 'block';
    if (minLenError) minLenError.style.display = password.length >= 6 ? 'none' : 'block';
    const confirmPass = document.getElementById('confirmPassword');
    const confirmError = document.getElementById('password-doesnt-match-error');
    if (confirmPass && confirmError) {
        confirmError.style.display = password === confirmPass.value ? 'none' : 'block';
    }
    updateButtonState();
}

function onChangeConfirmPassword() {
    onChangePassword();
}

function updateButtonState() {
    const email = document.getElementById('email')?.value || '';
    const password = document.getElementById('password')?.value || '';
    const btn = document.getElementById('login-button') || document.getElementById('register-button');
    if (!btn) return;
    
    const validEmail = validateEmail(email);
    const validPass = password.length >= 6;
    
    if (btn.id === 'login-button') {
        btn.disabled = !(validEmail && validPass);
    } else {
        const nome = document.getElementById('nome')?.value?.trim() || '';
        const cpf = document.getElementById('cpf')?.value?.trim() || '';
        const telefone = document.getElementById('telefone')?.value?.trim() || '';
        const tipo = document.getElementById('tipo_usuario')?.value || '';
        btn.disabled = !(validEmail && validPass && nome && cpf && telefone && tipo);
        
        ['nome', 'cpf', 'telefone'].forEach(id => {
            const field = document.getElementById(id);
            const error = document.getElementById(id + '-required-error');
            if (field && error) {
                error.style.display = field.value.trim() ? 'none' : 'block';
            }
        });
    }
}

async function login() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;
    loadingDiv.style.display = 'flex';
    try {
        const response = await fetch('/usuarios/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, senha})
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            window.location.href = 'home.html';
        } else {
            alert('Erro login: ' + data.erro);
        }
    } catch (err) {
        alert('Erro conexão');
    } finally {
        loadingDiv.style.display = 'none';
    }
}

async function register() {
    if (!document.getElementById('nome')) {
        window.location.href = 'register.html';
        return;
    }
    
    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value.trim();
    const senha = document.getElementById('password').value;
    const tipo_usuario = document.getElementById('tipo_usuario').value;
    
    if (!nome || !cpf || !email || !telefone || senha.length < 6 || !tipo_usuario) {
        alert('Preencha todos os campos corretamente!');
        return;
    }

    loadingDiv.style.display = 'flex';
    try {
        const response = await fetch('/usuarios/cadastrar', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                nome, cpf, email, telefone, senha,
                tipo_usuario,
                status: '1'
            })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            alert('Cadastro OK! Entrando...');
            window.location.href = 'home.html';
        } else {
            alert('Erro cadastro: ' + (data.erro || data.detalhes));
        }
    } catch (err) {
        alert('Erro servidor');
    } finally {
        loadingDiv.style.display = 'none';
    }
}

function recoverPassword() {
    alert('Em desenvolvimento');
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

function checkAuth() {
    if (window.location.pathname.includes('home.html') && !localStorage.getItem('token')) {
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', checkAuth);
