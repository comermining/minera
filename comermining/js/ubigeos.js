// ===== MÓDULO DE UBIGEOS =====
let ubigeosData = null;

const departamentoSelect = document.getElementById('departamentoSelect');
const provinciaSelect = document.getElementById('provinciaSelect');
const distritoSelect = document.getElementById('distritoSelect');

// Cargar JSON de ubigeos
async function loadUbigeos() {
    try {
        const response = await fetch('data/depa_prov_dist.json');
        if (!response.ok) throw new Error('Error al cargar el archivo JSON');
        ubigeosData = await response.json();
        loadDepartamentos();
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('❌ No se pudo cargar la lista de ubicaciones');
        if (departamentoSelect) {
            departamentoSelect.innerHTML = '<option value="">Error al cargar datos</option>';
        }
    }
}

// Cargar departamentos
function loadDepartamentos() {
    if (!ubigeosData || !departamentoSelect) return;
    departamentoSelect.innerHTML = '<option value="">Seleccionar departamento</option>';
    Object.keys(ubigeosData).sort().forEach(depto => {
        const option = document.createElement('option');
        option.value = depto;
        option.textContent = depto;
        departamentoSelect.appendChild(option);
    });
}

// Cargar provincias
function loadProvincias(departamento) {
    if (!provinciaSelect) return;
    provinciaSelect.innerHTML = '<option value="">Seleccionar provincia</option>';
    provinciaSelect.disabled = true;
    if (distritoSelect) {
        distritoSelect.innerHTML = '<option value="">Primero selecciona provincia</option>';
        distritoSelect.disabled = true;
    }
    
    if (departamento && ubigeosData && ubigeosData[departamento]) {
        provinciaSelect.disabled = false;
        Object.keys(ubigeosData[departamento]).sort().forEach(prov => {
            const option = document.createElement('option');
            option.value = prov;
            option.textContent = prov;
            provinciaSelect.appendChild(option);
        });
    }
}

// Cargar distritos
function loadDistritos(departamento, provincia) {
    if (!distritoSelect) return;
    distritoSelect.innerHTML = '<option value="">Seleccionar distrito</option>';
    distritoSelect.disabled = true;
    
    if (departamento && provincia && ubigeosData && 
        ubigeosData[departamento] && ubigeosData[departamento][provincia]) {
        distritoSelect.disabled = false;
        ubigeosData[departamento][provincia].sort().forEach(dist => {
            const option = document.createElement('option');
            option.value = dist;
            option.textContent = dist;
            distritoSelect.appendChild(option);
        });
    }
}

// Configurar eventos si los elementos existen
if (departamentoSelect) {
    departamentoSelect.addEventListener('change', (e) => {
        loadProvincias(e.target.value);
    });
}
if (provinciaSelect) {
    provinciaSelect.addEventListener('change', (e) => {
        loadDistritos(departamentoSelect?.value, e.target.value);
    });
}