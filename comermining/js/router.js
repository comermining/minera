// ===== MÓDULO DE RUTAS Y NAVEGACIÓN =====
const viewCache = new Map();

// Configuración de rutas
const routes = {
    'home': { file: 'views/home.html', title: 'Inicio', requireLogin: false },
    'concentrado-cobre': { file: 'views/concentrado-cobre.html', title: 'Concentrado de Cobre', requireLogin: true },
    'concentrado-plomo': { file: 'views/concentrado-plomo.html', title: 'Concentrado de Plomo', requireLogin: true },
    'concentrado-zinc': { file: 'views/concentrado-zinc.html', title: 'Concentrado de Zinc', requireLogin: true },
    'mineral-oro-plata': { file: 'views/mineral-oro-plata.html', title: 'Mineral de Oro y Plata', requireLogin: true },
    'mineral-cobre-oro-plata-menor': { file: 'views/mineral-cobre-oro-plata-menor.html', title: 'Mineral de Cobre, Oro y Plata (<10%)', requireLogin: true },
    'concentrado-cobre-oro-plata-mayor': { file: 'views/concentrado-cobre-oro-plata-mayor.html', title: 'Concentrado de Cobre, Oro y Plata (>10%)', requireLogin: true }
};

// Cargar una vista
async function loadView(routeName, params = {}) {
    const route = routes[routeName];
    if (!route) {
        console.error('Ruta no encontrada:', routeName);
        return false;
    }
    
    // Verificar login si es necesario
    if (route.requireLogin && !currentUser) {
        mostrarMensaje('🔐 Debes iniciar sesión para acceder a esta función');
        loginModal.show();
        return false;
    }
    
    // Mostrar loader
    const contentDiv = document.getElementById('dynamic-content');
    contentDiv.innerHTML = `
        <div class="view-loader">
            <div class="spinner-border text-warning spinner" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3 text-muted">Cargando ${route.title}...</p>
        </div>
    `;
    
    try {
        let html;
        if (viewCache.has(route.file)) {
            html = viewCache.get(route.file);
        } else {
            const response = await fetch(route.file);
            if (!response.ok) throw new Error(`Error cargando ${route.file}`);
            html = await response.text();
            viewCache.set(route.file, html);
        }
        
        contentDiv.innerHTML = html;
        
        // Ejecutar scripts específicos de la vista
        const scripts = contentDiv.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = oldScript.textContent;
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
        
        // Actualizar título
        document.title = `${route.title} | Minera Store`;
        
        // Mostrar botón volver en sidebar
        const volverBtn = document.getElementById('volverInicio');
        if (volverBtn) volverBtn.style.display = 'flex';
        
        return true;
    } catch (error) {
        console.error('Error cargando vista:', error);
        contentDiv.innerHTML = `
            <div class="alert alert-danger text-center py-5">
                <i class="bi bi-exclamation-triangle fs-1"></i>
                <h4 class="mt-3">Error al cargar el módulo</h4>
                <p>Por favor, intenta nuevamente más tarde.</p>
                <button class="btn btn-warning mt-2" onclick="location.reload()">
                    <i class="bi bi-arrow-repeat"></i> Recargar página
                </button>
            </div>
        `;
        return false;
    }
}

// Cargar vista por defecto (home)
async function loadDefaultView() {
    // Ocultar botón volver
    const volverBtn = document.getElementById('volverInicio');
    if (volverBtn) volverBtn.style.display = 'none';
    
    await loadView('home');
}

// Configurar botón volver al inicio
document.getElementById('volverInicio')?.addEventListener('click', (e) => {
    e.preventDefault();
    loadDefaultView();
});

// Configurar eventos de minerales (se ejecuta después de cargar el home)
function setupMineralEvents() {
    const mineralItems = {
        'Concentrado de Cobre': 'concentrado-cobre',
        'Concentrado de Plomo': 'concentrado-plomo',
        'Concentrado de Zinc': 'concentrado-zinc',
        'Mineral de Oro y Plata': 'mineral-oro-plata',
        'Mineral de Cobre, Oro y Plata (menor a 10%)': 'mineral-cobre-oro-plata-menor',
        'Concentrado de Cobre, Oro y Plata (mayor a 10%)': 'concentrado-cobre-oro-plata-mayor'
    };
    
    document.querySelectorAll('.mineral-item').forEach(item => {
        const text = item.querySelector('span')?.innerText;
        if (mineralItems[text]) {
            // Remover eventos anteriores
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            newItem.addEventListener('click', (e) => {
                e.stopPropagation();
                loadView(mineralItems[text]);
            });
        }
    });
}

// Escuchar evento de login para recargar eventos
document.addEventListener('userLogin', () => {
    setupMineralEvents();
});