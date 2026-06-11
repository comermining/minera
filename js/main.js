// ===== ARCHIVO PRINCIPAL =====

// Configuración de la API de precios
const PRECIOS_API_KEY = '453e8e4b76e706deb29853dcc8dde511';
const PRECIOS_BASE_URL = 'https://api.metalpriceapi.com/v1/latest';

// Precios referenciales
const PRECIOS_REFERENCIA = {
    cobre: { precio: 4.85, unidad: 'USD/Libra', simbolo: 'Cu', icono: 'bi bi-c-circle' },
    zinc: { precio: 1.42, unidad: 'USD/Libra', simbolo: 'Zn', icono: 'bi bi-bar-chart' },
    plomo: { precio: 1.05, unidad: 'USD/Libra', simbolo: 'Pb', icono: 'bi bi-box' },
    platino: { precio: 995.00, unidad: 'USD/Onza', simbolo: 'Pt', icono: 'bi bi-cpu' }
};

// Función para obtener precios de metales
async function fetchMetalPrices() {
    const loader = document.getElementById('preciosLoader');
    const content = document.getElementById('preciosContent');
    const lista = document.getElementById('preciosList');
    const timestampSpan = document.getElementById('timestampActualizacion');
    
    if (!loader || !content) return;
    
    loader.style.display = 'block';
    content.style.display = 'none';
    
    try {
        const url = `${PRECIOS_BASE_URL}?api_key=${PRECIOS_API_KEY}&base=USD&currencies=XAU,XAG`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            if (data.timestamp) {
                const date = new Date(data.timestamp * 1000);
                timestampSpan.innerHTML = `📅 Última actualización API: ${date.toLocaleString()}`;
            }
            
            const rates = data.rates;
            lista.innerHTML = '';
            
            const oroPrice = rates.USDXAU || 2915.00;
            lista.innerHTML += crearItemPrecio('Oro', 'Au', oroPrice, 'USD/Onza', 'bi bi-gem', true);
            
            const plataPrice = rates.USDXAG || 32.50;
            lista.innerHTML += crearItemPrecio('Plata', 'Ag', plataPrice, 'USD/Onza', 'bi bi-database', true);
            
            lista.innerHTML += crearItemPrecio('Cobre', PRECIOS_REFERENCIA.cobre.simbolo, PRECIOS_REFERENCIA.cobre.precio, PRECIOS_REFERENCIA.cobre.unidad, PRECIOS_REFERENCIA.cobre.icono, false);
            lista.innerHTML += crearItemPrecio('Zinc', PRECIOS_REFERENCIA.zinc.simbolo, PRECIOS_REFERENCIA.zinc.precio, PRECIOS_REFERENCIA.zinc.unidad, PRECIOS_REFERENCIA.zinc.icono, false);
            lista.innerHTML += crearItemPrecio('Plomo', PRECIOS_REFERENCIA.plomo.simbolo, PRECIOS_REFERENCIA.plomo.precio, PRECIOS_REFERENCIA.plomo.unidad, PRECIOS_REFERENCIA.plomo.icono, false);
            lista.innerHTML += crearItemPrecio('Platino', PRECIOS_REFERENCIA.platino.simbolo, PRECIOS_REFERENCIA.platino.precio, PRECIOS_REFERENCIA.platino.unidad, PRECIOS_REFERENCIA.platino.icono, false);
            
            loader.style.display = 'none';
            content.style.display = 'block';
        } else {
            throw new Error(data.error?.info || 'Error al obtener datos');
        }
    } catch (error) {
        console.error('Error al cargar precios:', error);
        mostrarPreciosReferenciales(lista, timestampSpan);
        loader.style.display = 'none';
        content.style.display = 'block';
    }
}

function crearItemPrecio(nombre, simbolo, precio, unidad, icono, esEnVivo) {
    const badge = esEnVivo ? '<span class="metal-en-vivo">en vivo</span>' : '<span class="metal-referencial">referencial</span>';
    const precioFormateado = typeof precio === 'number' ? precio.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : precio;
    
    return `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>
                <i class="${icono} text-warning me-2"></i>
                <strong>${nombre} (${simbolo})</strong>
                ${badge}
            </span>
            <span class="fw-bold precio-metal">$${precioFormateado} ${unidad}</span>
        </li>
    `;
}

function mostrarPreciosReferenciales(lista, timestampSpan) {
    timestampSpan.innerHTML = `📅 Usando valores referenciales (${new Date().toLocaleString()})`;
    lista.innerHTML = '';
    
    lista.innerHTML += crearItemPrecio('Oro', 'Au', 2915.00, 'USD/Onza', 'bi bi-gem', false);
    lista.innerHTML += crearItemPrecio('Plata', 'Ag', 32.50, 'USD/Onza', 'bi bi-database', false);
    lista.innerHTML += crearItemPrecio('Cobre', PRECIOS_REFERENCIA.cobre.simbolo, PRECIOS_REFERENCIA.cobre.precio, PRECIOS_REFERENCIA.cobre.unidad, PRECIOS_REFERENCIA.cobre.icono, false);
    lista.innerHTML += crearItemPrecio('Zinc', PRECIOS_REFERENCIA.zinc.simbolo, PRECIOS_REFERENCIA.zinc.precio, PRECIOS_REFERENCIA.zinc.unidad, PRECIOS_REFERENCIA.zinc.icono, false);
    lista.innerHTML += crearItemPrecio('Plomo', PRECIOS_REFERENCIA.plomo.simbolo, PRECIOS_REFERENCIA.plomo.precio, PRECIOS_REFERENCIA.plomo.unidad, PRECIOS_REFERENCIA.plomo.icono, false);
    lista.innerHTML += crearItemPrecio('Platino', PRECIOS_REFERENCIA.platino.simbolo, PRECIOS_REFERENCIA.platino.precio, PRECIOS_REFERENCIA.platino.unidad, PRECIOS_REFERENCIA.platino.icono, false);
}

// Funciones del modal de venta
let currentCategory = "";
const sellModal = new bootstrap.Modal(document.getElementById('sellModal'));
const sellModalTitle = document.getElementById('sellModalTitle');
const sellDniInput = document.getElementById('sellDni');

function openSellModal(category) {
    currentCategory = category;
    sellModalTitle.innerHTML = `<i class="bi bi-tag me-2"></i>Vender - ${category}`;
    document.getElementById('sellDescription').value = '';
    sellDniInput.value = currentUser ? currentUser.dni : '';
    
    if (departamentoSelect) {
        departamentoSelect.value = '';
        loadDepartamentos();
    }
    if (provinciaSelect) {
        provinciaSelect.innerHTML = '<option value="">Primero selecciona departamento</option>';
        provinciaSelect.disabled = true;
    }
    if (distritoSelect) {
        distritoSelect.innerHTML = '<option value="">Primero selecciona provincia</option>';
        distritoSelect.disabled = true;
    }
    
    sellModal.show();
}

document.getElementById('sellForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = document.getElementById('sellDescription').value.trim();
    const dni = sellDniInput.value.trim();
    const departamento = departamentoSelect?.value;
    const provincia = provinciaSelect?.value;
    const distrito = distritoSelect?.value;
    
    if (!description) { mostrarMensaje('❌ Por favor, describe lo que ofreces o buscas'); return; }
    if (!dni) { mostrarMensaje('❌ Debes iniciar sesión para publicar una oferta'); loginModal.show(); sellModal.hide(); return; }
    if (!departamento || !provincia || !distrito) { mostrarMensaje('❌ Selecciona tu ubicación completa'); return; }
    
    mostrarMensaje(`✅ Oferta publicada en ${currentCategory} correctamente. ¡Gracias ${currentUser?.nombre || ''}!`);
    sellModal.hide();
    document.getElementById('sellForm').reset();
});

// Sidebar toggle
const sidebar = document.getElementById('sidebar');
const menuToggleBtn = document.getElementById('menuToggleBtn');
const sidebarOverlay = document.getElementById('sidebarOverlay');
let isDesktopCollapsed = false;

function isMobile() { return window.innerWidth < 992; }

function toggleDesktopSidebar() { 
    if (!isMobile()) { 
        isDesktopCollapsed = !isDesktopCollapsed; 
        sidebar.classList.toggle('collapsed', isDesktopCollapsed); 
        localStorage.setItem('sidebarCollapsed', isDesktopCollapsed); 
    } 
}

function toggleMobileSidebar() { 
    if (isMobile()) { 
        sidebar.classList.toggle('mobile-open'); 
        sidebarOverlay?.classList.toggle('active'); 
    } 
}

menuToggleBtn?.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    isMobile() ? toggleMobileSidebar() : toggleDesktopSidebar(); 
});

sidebarOverlay?.addEventListener('click', () => { 
    sidebar.classList.remove('mobile-open'); 
    sidebarOverlay.classList.remove('active'); 
});

document.querySelectorAll('.sidebar .nav-link-custom').forEach(link => { 
    link.addEventListener('click', () => { 
        if (isMobile()) { 
            sidebar.classList.remove('mobile-open'); 
            sidebarOverlay?.classList.remove('active'); 
        } 
    }); 
});

window.addEventListener('resize', () => { 
    if (isMobile()) { 
        sidebar.classList.remove('collapsed', 'mobile-open'); 
        sidebarOverlay?.classList.remove('active'); 
    } else { 
        const saved = localStorage.getItem('sidebarCollapsed') === 'true'; 
        sidebar.classList.toggle('collapsed', saved); 
        isDesktopCollapsed = saved; 
        sidebar.classList.remove('mobile-open'); 
        sidebarOverlay?.classList.remove('active'); 
    } 
});

if (!isMobile() && localStorage.getItem('sidebarCollapsed') === 'true') { 
    sidebar.classList.add('collapsed'); 
    isDesktopCollapsed = true; 
}

// Eventos adicionales
document.getElementById('editarPerfil')?.addEventListener('click', (e) => { 
    e.preventDefault(); 
    requireLogin('Editar Perfil', () => mostrarMensaje(`✏️ Editando perfil de ${currentUser.nombre}`)); 
});

document.getElementById('misPublicaciones')?.addEventListener('click', (e) => { 
    e.preventDefault(); 
    requireLogin('Mis Publicaciones', () => mostrarMensaje(`📄 Publicaciones de ${currentUser.nombre}`)); 
});

document.getElementById('historial')?.addEventListener('click', (e) => { 
    e.preventDefault(); 
    requireLogin('Historial de Trabajo', () => mostrarMensaje(`📋 Historial de trabajo de ${currentUser.nombre}`)); 
});

document.getElementById('ubicarConcesion')?.addEventListener('click', (e) => { 
    e.preventDefault(); 
    simularUbicacion(); 
});

document.getElementById('appCoordenadas')?.addEventListener('click', (e) => { 
    e.preventDefault(); 
    obtenerCoordenadasOffline(); 
});

document.getElementById('priceBanner')?.addEventListener('click', () => {
    fetchMetalPrices();
    new bootstrap.Modal(document.getElementById('preciosModal')).show();
});

// Inicializar la aplicación
async function initApp() {
    updateSessionUI();
    await loadUbigeos();
    await loadDefaultView();
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);