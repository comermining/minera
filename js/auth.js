// ===== MÓDULO DE AUTENTICACIÓN =====
let currentUser = null;

// Elementos DOM
const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
const userInfoDiv = document.getElementById('userInfo');
const userNameSpan = document.getElementById('userNameDisplay');
const userDniSpan = document.getElementById('userDniDisplay');
const iniciarSesionSidebar = document.getElementById('iniciarSesionSidebar');
const cerrarSesionSidebar = document.getElementById('cerrarSesionSidebar');

// Función para mostrar mensajes toast
function mostrarMensaje(texto) {
    const toastMsg = document.getElementById('toastMsg');
    if(toastMsg) toastMsg.innerText = texto;
    const toastEl = document.getElementById('liveToast');
    if(toastEl) new bootstrap.Toast(toastEl).show();
}

// Actualizar UI según estado de sesión
function updateSessionUI() {
    if (currentUser) {
        userInfoDiv.style.display = 'flex';
        userNameSpan.textContent = currentUser.nombre;
        userDniSpan.textContent = `[${currentUser.dni}]`;
        iniciarSesionSidebar.style.display = 'none';
        cerrarSesionSidebar.style.display = 'flex';
    } else {
        userInfoDiv.style.display = 'none';
        iniciarSesionSidebar.style.display = 'flex';
        cerrarSesionSidebar.style.display = 'none';
    }
}

// Manejar login
function handleLogin(nombre, dni, celular) {
    currentUser = { nombre: nombre, dni: dni, celular: celular };
    updateSessionUI();
    mostrarMensaje(`✅ Bienvenido ${nombre}, has iniciado sesión correctamente.`);
    loginModal.hide();
    
    // Disparar evento personalizado
    document.dispatchEvent(new CustomEvent('userLogin', { detail: currentUser }));
}

// Manejar logout
function handleLogout() {
    currentUser = null;
    updateSessionUI();
    mostrarMensaje('🔒 Sesión cerrada correctamente.');
    
    // Disparar evento personalizado
    document.dispatchEvent(new CustomEvent('userLogout'));
}

// Verificar login requerido
function requireLogin(actionName, callback) {
    if (currentUser) {
        if (callback) callback();
    } else {
        mostrarMensaje(`🔐 Debes iniciar sesión para usar "${actionName}"`);
        loginModal.show();
    }
}

// Configurar eventos de login
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('loginNombre').value.trim();
    let dni = document.getElementById('loginDni').value.trim();
    const celular = document.getElementById('loginCelular').value.trim();
    
    if (!nombre) { mostrarMensaje('❌ Ingresa el nombre completo'); return; }
    if (!dni.match(/^\d{8}$/)) { mostrarMensaje('❌ DNI debe tener 8 dígitos numéricos'); return; }
    if (!celular) { mostrarMensaje('❌ Ingresa el número de celular'); return; }
    
    handleLogin(nombre, dni, celular);
    document.getElementById('loginForm').reset();
});

document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
cerrarSesionSidebar?.addEventListener('click', (e) => { 
    e.preventDefault(); 
    handleLogout(); 
    if (typeof loadDefaultView === 'function') loadDefaultView();
});
iniciarSesionSidebar?.addEventListener('click', (e) => { 
    e.preventDefault(); 
    loginModal.show(); 
});