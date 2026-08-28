// ==================== CONCENTRADO DE ZINC - VALORIZACIÓN ====================
// Términos comerciales (según Excel)
const terminos = {
    pagableZn: 85, deduccionZn: 8,
    pagableAg: 65, deduccionAg: 3.5,
    maquila: 395,
    // Escalador
    a: -1950,
    b: 0.18,
    // Penalidades
    penAsSbLibre: 0.3, penAsSbCada: 0.1, penAsSbCosto: 3.5,
    penFeLibre: 5, penFeCada: 1, penFeCosto: 3.5,
    penSio2Libre: 2, penSio2Cada: 1, penSio2Costo: 2.5,
    penMnLibre: 0.3, penMnCada: 0.1, penMnCosto: 2.5,
    penHgLibre: 20, penHgCada: 30, penHgCosto: 10,
    penH2OLibre: 10, penH2OCada: 1, penH2OCosto: 3
};

// Constantes
const LB_POR_TM = 2204.623;

function calcularPenalidadUnidades(valor, libre, porCada) {
    if (valor <= libre) return 0;
    return (valor - libre) / porCada;
}

function actualizarTMSNeto() {
    const tmh = parseFloat(document.getElementById('tmh').value) || 0;
    const humedad = parseFloat(document.getElementById('humedad').value) || 0;
    const merma = parseFloat(document.getElementById('merma').value) || 0;
    const tms = tmh * (1 - humedad / 100);
    const tmsNeto = tms * (1 - merma / 100);
    const tmsPreview = document.getElementById('tmsNetoPreview');
    if (tmsPreview) tmsPreview.value = tmsNeto.toFixed(2);
    return tmsNeto;
}

function mostrarMensaje(texto) {
    const toastMsg = document.getElementById('toastMsg');
    if (toastMsg) toastMsg.innerText = texto;
    const toastEl = document.getElementById('liveToast');
    if (toastEl) new bootstrap.Toast(toastEl).show();
}

function calcularValorizacionCompleta() {
    // Datos de entrada
    const nombreCliente = document.getElementById('nombreCliente').value || 'Anónimo';
    const tmh = parseFloat(document.getElementById('tmh').value) || 0;
    const humedad = parseFloat(document.getElementById('humedad').value) || 0;
    const merma = parseFloat(document.getElementById('merma').value) || 0;
    const igv = parseFloat(document.getElementById('igv').value) || 18;
    const leyZn = parseFloat(document.getElementById('leyZn').value) || 0;
    const leyAg = parseFloat(document.getElementById('leyAg').value) || 0;
    const precioZn = parseFloat(document.getElementById('precioZn').value) || 0;
    const precioAg = parseFloat(document.getElementById('precioAg').value) || 0;
    
    const as = parseFloat(document.getElementById('contAs').value) || 0;
    const sb = parseFloat(document.getElementById('contSb').value) || 0;
    const fe = parseFloat(document.getElementById('contFe').value) || 0;
    const sio2 = parseFloat(document.getElementById('contSio2').value) || 0;
    const mn = parseFloat(document.getElementById('contMn').value) || 0;
    const hg = parseFloat(document.getElementById('contHg').value) || 0;

    const asSb = as + sb;

    // PAGOS
    // 1. Zinc
    const contenidoPagableZn = (leyZn - terminos.deduccionZn) * (terminos.pagableZn / 100);
    const precioZnTM = precioZn * LB_POR_TM;
    const pagoZn = contenidoPagableZn * precioZnTM;

    // 2. Plata (sin conversión a Oz/TM, se mantiene Oz/TC como en Excel)
    const contenidoPagableAg = (leyAg - terminos.deduccionAg) * (terminos.pagableAg / 100);
    const pagoAg = contenidoPagableAg * precioAg;

    const totalPagos = pagoZn + pagoAg;

    // DEDUCCIONES
    const maquila = terminos.maquila;
    
    // Escalador: MAX(0, PrecioZnTM + a) * b
    const escalador = Math.max(0, (precioZnTM + terminos.a)) * terminos.b;

    // Penalidades
    const penAsSbUnidades = calcularPenalidadUnidades(asSb, terminos.penAsSbLibre, terminos.penAsSbCada);
    const penAsSb = penAsSbUnidades * terminos.penAsSbCosto;

    const penFeUnidades = calcularPenalidadUnidades(fe, terminos.penFeLibre, terminos.penFeCada);
    const penFe = penFeUnidades * terminos.penFeCosto;

    const penSio2Unidades = calcularPenalidadUnidades(sio2, terminos.penSio2Libre, terminos.penSio2Cada);
    const penSio2 = penSio2Unidades * terminos.penSio2Costo;

    const penMnUnidades = calcularPenalidadUnidades(mn, terminos.penMnLibre, terminos.penMnCada);
    const penMn = penMnUnidades * terminos.penMnCosto;

    const penHgUnidades = calcularPenalidadUnidades(hg, terminos.penHgLibre, terminos.penHgCada);
    const penHg = penHgUnidades * terminos.penHgCosto;

    const penH2OUnidades = calcularPenalidadUnidades(humedad, terminos.penH2OLibre, terminos.penH2OCada);
    const penH2O = penH2OUnidades * terminos.penH2OCosto;

    // Total deducciones
    const totalDeducciones = maquila + escalador + penAsSb + penFe + penSio2 + penMn + penHg + penH2O;
    
    // Valor por TMS
    const valorPorTMS = totalPagos - totalDeducciones;

    // Total por lote (fórmula exacta del Excel: (1 - IGV/100))
    const totalLote = valorPorTMS * tmh * (1 - (humedad + merma) / 100) * (1 - igv / 100);

    return {
        pagos: {
            zinc: { contenido: contenidoPagableZn, precio: precioZnTM, resultado: pagoZn },
            plata: { contenido: contenidoPagableAg, precio: precioAg, resultado: pagoAg }
        },
        deducciones: {
            maquila: { resultado: maquila },
            escalador: { resultado: escalador },
            penAsSb: { valor: asSb, unidades: penAsSbUnidades, resultado: penAsSb },
            penFe: { valor: fe, unidades: penFeUnidades, resultado: penFe },
            penSio2: { valor: sio2, unidades: penSio2Unidades, resultado: penSio2 },
            penMn: { valor: mn, unidades: penMnUnidades, resultado: penMn },
            penHg: { valor: hg, unidades: penHgUnidades, resultado: penHg },
            penH2O: { valor: humedad, unidades: penH2OUnidades, resultado: penH2O }
        },
        totales: {
            deducciones: totalDeducciones,
            valorPorTMS: valorPorTMS,
            igv: igv,
            totalLote: totalLote
        }
    };
}

// Función para generar PDF (misma estructura que Cobre/Plomo)
function generarPDF() {
    const nombreCliente = document.getElementById('nombreCliente').value || 'Anónimo';
    const fecha = new Date().toLocaleString();
    const datos = calcularValorizacionCompleta();

    const fmt = (num) => Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtFactor = (num) => Number(num).toFixed(4);

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Valorización de Zinc</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; background: white; font-size: 11px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { color: #0a2a36; }
        .header h3 { color: #f6b83d; }
        hr { border: 1px solid #0a2a36; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid #dee2e6; padding: 6px 8px; text-align: center; }
        th { background-color: #f8f9fa; }
        .text-end { text-align: right; }
        .text-start { text-align: left; }
        .fw-bold { font-weight: bold; }
        .table-warning { background-color: #fff3cd; }
        .table-success { background-color: #d1e7dd; }
        .table-primary { background-color: #cfe2ff; }
        .table-secondary { background-color: #e9ecef; }
        .footer { text-align: center; margin-top: 20px; font-size: 9px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="header">
        <h2>MINERA STORE - COMER MINING</h2>
        <h3>Valorizacion de Concentrado de Zinc</h3>
        <p><strong>Cliente:</strong> ${nombreCliente} | <strong>Fecha:</strong> ${fecha}</p>
        <hr>
    </div>

    <!-- TABLA PAGOS -->
    <table>
        <thead><tr class="table-secondary"><th colspan="6">PAGOS</th></tr>
        <tr class="table-secondary"><th>Concepto</th><th>Contenido</th><th>Operador</th><th>Precio</th><th>Unidad</th><th>Resultado ($/TMS)</th></tr></thead>
        <tbody>
            <tr><td class="text-start"><strong>ZINC (Zn)</strong></td><td class="text-end">${fmt(datos.pagos.zinc.contenido)}</td><td>x</td><td class="text-end">${fmt(datos.pagos.zinc.precio)}</td><td>$/TM</td><td class="text-end fw-bold">${fmt(datos.pagos.zinc.resultado)}</td></tr>
            <tr><td class="text-start"><strong>PLATA (Ag)</strong></td><td class="text-end">${fmt(datos.pagos.plata.contenido)}</td><td>x</td><td class="text-end">${fmt(datos.pagos.plata.precio)}</td><td>$/Oz</td><td class="text-end fw-bold">${fmt(datos.pagos.plata.resultado)}</td></tr>
        </tbody>
    </table>

    <!-- TABLA DEDUCCIONES -->
    <table>
        <thead><tr class="table-secondary"><th colspan="6">DEDUCCIONES</th></tr>
        <tr class="table-secondary"><th>Concepto</th><th>Factor</th><th>Operador</th><th>Valor</th><th>Unidad</th><th>Resultado ($/TMS)</th></tr></thead>
        <tbody>
            <tr><td class="text-start"><strong>Maquila</strong></td><td>-</td><td></td><td class="text-end">${fmt(datos.deducciones.maquila.resultado)}</td><td>$/TMS</td><td class="text-end">${fmt(datos.deducciones.maquila.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Escalador</strong></td><td>-</td><td></td><td class="text-end">${fmt(datos.deducciones.escalador.resultado)}</td><td>$/TMS</td><td class="text-end">${fmt(datos.deducciones.escalador.resultado)}</td></tr>
        </tbody>
    </table>

    <!-- TABLA PENALIDADES -->
    <table>
        <thead><tr class="table-secondary"><th colspan="6">PENALIDADES</th></tr>
        <tr class="table-secondary"><th>Concepto</th><th>Valor</th><th>Libre</th><th>Por cada</th><th>Unidades</th><th>Resultado</th></tr></thead>
        <tbody>
            <tr><td class="text-start"><strong>As+Sb</strong></td><td class="text-end">${fmt(datos.deducciones.penAsSb.valor)}%</td><td class="text-end">0.3%</td><td class="text-end">0.1%</td><td class="text-end">${fmt(datos.deducciones.penAsSb.unidades)}</td><td class="text-end">${fmt(datos.deducciones.penAsSb.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Fe</strong></td><td class="text-end">${fmt(datos.deducciones.penFe.valor)}%</td><td class="text-end">5%</td><td class="text-end">1%</td><td class="text-end">${fmt(datos.deducciones.penFe.unidades)}</td><td class="text-end">${fmt(datos.deducciones.penFe.resultado)}</td></tr>
            <tr><td class="text-start"><strong>SiO2</strong></td><td class="text-end">${fmt(datos.deducciones.penSio2.valor)}%</td><td class="text-end">2%</td><td class="text-end">1%</td><td class="text-end">${fmt(datos.deducciones.penSio2.unidades)}</td><td class="text-end">${fmt(datos.deducciones.penSio2.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Mn</strong></td><td class="text-end">${fmt(datos.deducciones.penMn.valor)}%</td><td class="text-end">0.3%</td><td class="text-end">0.1%</td><td class="text-end">${fmt(datos.deducciones.penMn.unidades)}</td><td class="text-end">${fmt(datos.deducciones.penMn.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Hg</strong></td><td class="text-end">${fmt(datos.deducciones.penHg.valor)} ppm</td><td class="text-end">20 ppm</td><td class="text-end">30 ppm</td><td class="text-end">${fmt(datos.deducciones.penHg.unidades)}</td><td class="text-end">${fmt(datos.deducciones.penHg.resultado)}</td></tr>
            <tr><td class="text-start"><strong>H2O</strong></td><td class="text-end">${fmt(datos.deducciones.penH2O.valor)}%</td><td class="text-end">10%</td><td class="text-end">1%</td><td class="text-end">${fmt(datos.deducciones.penH2O.unidades)}</td><td class="text-end">${fmt(datos.deducciones.penH2O.resultado)}</td></tr>
        </tbody>
    </table>

    <!-- TABLA TOTALES -->
    <table>
        <tbody>
            <tr class="table-warning"><td colspan="5"><strong>TOTAL DE DEDUCCIONES</strong></td><td class="text-end fw-bold">${fmt(datos.totales.deducciones)}</td></tr>
            <tr class="table-success"><td colspan="5"><strong>TOTAL /TM (US $/TMS)</strong></td><td class="text-end fw-bold">${fmt(datos.totales.valorPorTMS)}</td></tr>
            <tr><td colspan="3"><strong>IGV %</strong></td><td colspan="3">${fmt(datos.totales.igv)}%</td></tr>
            <tr class="table-primary"><td colspan="5"><strong>TOTAL POR LOTE (US $)</strong></td><td class="text-end"><strong>$${fmt(datos.totales.totalLote)}</strong></td></tr>
        </tbody>
    </table>

    <div class="footer"><hr>Documento generado por MINERA STORE - Todos los derechos reservados.</div>
</body>
</html>`;

    // Generación con html2canvas + jsPDF (método probado)
    const contenedor = document.createElement('div');
    contenedor.innerHTML = htmlContent;
    
    contenedor.style.position = 'absolute';
    contenedor.style.left = '-9999px';
    contenedor.style.top = '0';
    contenedor.style.width = '1200px';
    contenedor.style.height = 'auto';
    contenedor.style.backgroundColor = '#ffffff';
    contenedor.style.zIndex = '-1';

    document.body.appendChild(contenedor);

    setTimeout(async () => {
        try {
            const canvas = await html2canvas(contenedor, {
                scale: 1.7,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('l', 'mm', 'a4');
            
            const margin = 5;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const printableWidth = pageWidth - (2 * margin);
            const printableHeight = pageHeight - (2 * margin);
            const scale = Math.min(printableWidth / canvas.width, printableHeight / canvas.height);
            const imgWidth = canvas.width * scale;
            const imgHeight = canvas.height * scale;

            pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);

            const blobUrl = pdf.output('bloburl');
            window.open(blobUrl, '_blank');

            document.body.removeChild(contenedor);
            mostrarMensaje('✅ PDF abierto en el navegador');
        } catch (error) {
            document.body.removeChild(contenedor);
            mostrarMensaje('❌ Error al generar el PDF');
            console.error('Error:', error);
        }
    }, 300);
}