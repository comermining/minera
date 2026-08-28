// ==================== CONCENTRADO DE PLOMO - VALORIZACIÓN ====================
// Términos comerciales (basados en el Excel)
const terminos = {
    pagablePb: 95, deduccionPb: 3,
    pagableAg: 93, deduccionAg: 2, gastosRefAg: 2.3,
    pagableAu: 93, deduccionAu: 0.06, gastosRefAu: 15,
    maquila: 250,
    // Escalador
    escaladorBase: 1700,
    escaladorFactor: 0.15,
    // Penalidades
    penAsLibre: 0.2, penAsCada: 0.1, penAsCosto: 4,
    penSbLibre: 0.3, penSbCada: 0.1, penSbCosto: 3.5,
    penBiLibre: 0.05, penBiCada: 0.01, penBiCosto: 3,
    penZnLibre: 3, penZnCada: 1, penZnCosto: 3,
    penHgLibre: 30, penHgCada: 10, penHgCosto: 7,
    penH2OLibre: 10, penH2OCada: 1, penH2OCosto: 3
};

// Constantes
const TC_A_TM_FACTOR = 1.1023;
const OZ_POR_G = 31.1035;
const factorMercurio = 1; // Ajuste para Hg

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

    const leyPb = parseFloat(document.getElementById('leyPb').value) || 0;
    const leyAg = parseFloat(document.getElementById('leyAg').value) || 0;
    const leyAu = parseFloat(document.getElementById('leyAu').value) || 0;

    const precioPb = parseFloat(document.getElementById('precioPb').value) || 0;
    const precioAg = parseFloat(document.getElementById('precioAg').value) || 0;
    const precioAu = parseFloat(document.getElementById('precioAu').value) || 0;

    const as = parseFloat(document.getElementById('contAs').value) || 0;
    const sb = parseFloat(document.getElementById('contSb').value) || 0;
    const bi = parseFloat(document.getElementById('contBi').value) || 0;
    const zn = parseFloat(document.getElementById('contZn').value) || 0;
    const hg = parseFloat(document.getElementById('contHg').value) || 0;
    const analisisQuimico = parseFloat(document.getElementById('analisisQuimico').value) || 0;

    // PAGOS (Fórmulas exactas del Excel)
    // 1. Plomo: MIN((LeyPb * PagablePb/100), (LeyPb - DeduccionPb)) * PrecioPb
    const contenidoPagablePb = Math.min((leyPb * terminos.pagablePb / 100), (leyPb - terminos.deduccionPb));
    const pagoPb = contenidoPagablePb * precioPb;

    // 2. Plata: (LeyAg - (DeduccionAg/31.1035)) * (PagableAg/100) * PrecioAg
    const contenidoPagableAg = (leyAg - (terminos.deduccionAg / OZ_POR_G)) * (terminos.pagableAg / 100);
    const pagoAg = contenidoPagableAg * precioAg;

    // 3. Oro: (LeyAu - DeduccionAu) * (PagableAu/100) * PrecioAu
    const contenidoPagableAu = (leyAu - terminos.deduccionAu) * (terminos.pagableAu / 100);
    const pagoAu = contenidoPagableAu * precioAu;

    const totalPagos = pagoPb + pagoAg + pagoAu;

    // DEDUCCIONES
    // Maquila
    const maquila = terminos.maquila;

    // Escalador Plomo: MAX(0, (MIN(PrecioPb, 2400) - 1700)) * 0.15
    const precioPbLimitado = Math.min(precioPb, 2400);
    const escaladorPb = Math.max(0, (precioPbLimitado - terminos.escaladorBase)) * terminos.escaladorFactor;

    // Gastos Refinación Ag: ContenidoPagableAg * GastosRefAg
    const refAg = contenidoPagableAg * terminos.gastosRefAg;

    // Escalador Ag: (PrecioAg - 15) * ContenidoPagableAg * (10/100)
    const escaladorAg = (precioAg - 15) * contenidoPagableAg * 0.10;

    // Gastos Refinación Au: ContenidoPagableAu * GastosRefAu
    const refAu = contenidoPagableAu * terminos.gastosRefAu;

    // PENALIDADES
    const penalidadAsUnidades = calcularPenalidadUnidades(as, terminos.penAsLibre, terminos.penAsCada);
    const penalidadAs = penalidadAsUnidades * terminos.penAsCosto;

    const penalidadSbUnidades = calcularPenalidadUnidades(sb, terminos.penSbLibre, terminos.penSbCada);
    const penalidadSb = penalidadSbUnidades * terminos.penSbCosto;

    const penalidadBiUnidades = calcularPenalidadUnidades(bi, terminos.penBiLibre, terminos.penBiCada);
    const penalidadBi = penalidadBiUnidades * terminos.penBiCosto;

    const penalidadZnUnidades = calcularPenalidadUnidades(zn, terminos.penZnLibre, terminos.penZnCada);
    const penalidadZn = penalidadZnUnidades * terminos.penZnCosto;

    const penalidadHgUnidades = calcularPenalidadUnidades(hg, terminos.penHgLibre, terminos.penHgCada);
    const penalidadHg = penalidadHgUnidades * terminos.penHgCosto;

    // Penalidad por Humedad (H2O)
    const penalidadH2OUnidades = calcularPenalidadUnidades(humedad, terminos.penH2OLibre, terminos.penH2OCada);
    const penalidadH2O = penalidadH2OUnidades * terminos.penH2OCosto;

    // Análisis
    const analisisResultado = analisisQuimico;

    // TOTALES
    const totalDeducciones = maquila + escaladorPb + refAg + escaladorAg + refAu + 
                              penalidadAs + penalidadSb + penalidadBi + penalidadZn + 
                              penalidadHg + penalidadH2O + analisisResultado;

    const valorPorTMS = totalPagos - totalDeducciones;

    return {
        pagos: {
            plomo: { contenido: contenidoPagablePb, precio: precioPb, resultado: pagoPb },
            plata: { contenido: contenidoPagableAg, precio: precioAg, resultado: pagoAg },
            oro:   { contenido: contenidoPagableAu, precio: precioAu, resultado: pagoAu }
        },
        deducciones: {
            maquila: { resultado: maquila },
            escaladorPb: { resultado: escaladorPb },
            refAg: { resultado: refAg },
            escaladorAg: { resultado: escaladorAg },
            refAu: { resultado: refAu },
            penalidadAs: { valor: as, unidades: penalidadAsUnidades, resultado: penalidadAs },
            penalidadSb: { valor: sb, unidades: penalidadSbUnidades, resultado: penalidadSb },
            penalidadBi: { valor: bi, unidades: penalidadBiUnidades, resultado: penalidadBi },
            penalidadZn: { valor: zn, unidades: penalidadZnUnidades, resultado: penalidadZn },
            penalidadHg: { valor: hg, unidades: penalidadHgUnidades, resultado: penalidadHg },
            penalidadH2O: { valor: humedad, unidades: penalidadH2OUnidades, resultado: penalidadH2O },
            analisis: analisisResultado
        },
        totales: {
            deducciones: totalDeducciones,
            valorPorTMS: valorPorTMS,
            igv: igv
        }
    };
}

// Función para generar PDF (misma que cobre, adaptada)
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
    <title>Valorización de Plomo</title>
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
        <h3>Valorizacion de Concentrado de Plomo</h3>
        <p><strong>Cliente:</strong> ${nombreCliente} | <strong>Fecha:</strong> ${fecha}</p>
        <hr>
    </div>

    <!-- TABLA PAGOS -->
    <table>
        <thead><tr class="table-secondary"><th colspan="6">PAGOS</th></tr>
        <tr class="table-secondary"><th>Concepto</th><th>Contenido</th><th>Operador</th><th>Precio</th><th>Unidad</th><th>Resultado ($/TMS)</th></tr></thead>
        <tbody>
            <tr><td class="text-start"><strong>PLOMO (Pb)</strong></td><td class="text-end">${fmt(datos.pagos.plomo.contenido)}</td><td>x</td><td class="text-end">${fmt(datos.pagos.plomo.precio)}</td><td>$/TM</td><td class="text-end fw-bold">${fmt(datos.pagos.plomo.resultado)}</td></tr>
            <tr><td class="text-start"><strong>PLATA (Ag)</strong></td><td class="text-end">${fmt(datos.pagos.plata.contenido)}</td><td>x</td><td class="text-end">${fmt(datos.pagos.plata.precio)}</td><td>$/Oz</td><td class="text-end fw-bold">${fmt(datos.pagos.plata.resultado)}</td></tr>
            <tr><td class="text-start"><strong>ORO (Au)</strong></td><td class="text-end">${fmt(datos.pagos.oro.contenido)}</td><td>x</td><td class="text-end">${fmt(datos.pagos.oro.precio)}</td><td>$/Oz</td><td class="text-end fw-bold">${fmt(datos.pagos.oro.resultado)}</td></tr>
        </tbody>
    </table>

    <!-- TABLA DEDUCCIONES -->
    <table>
        <thead><tr class="table-secondary"><th colspan="6">DEDUCCIONES</th></tr>
        <tr class="table-secondary"><th>Concepto</th><th>Factor</th><th>Operador</th><th>Valor</th><th>Unidad</th><th>Resultado ($/TMS)</th></tr></thead>
        <tbody>
            <tr><td class="text-start"><strong>Maquila</strong></td><td>-</td><td></td><td class="text-end">${fmt(datos.deducciones.maquila.resultado)}</td><td>$/TMS</td><td class="text-end">${fmt(datos.deducciones.maquila.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Escalador Pb</strong></td><td>-</td><td></td><td class="text-end">${fmt(datos.deducciones.escaladorPb.resultado)}</td><td>$/TMS</td><td class="text-end">${fmt(datos.deducciones.escaladorPb.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Refinación Ag</strong></td><td class="text-end">${fmt(datos.pagos.plata.contenido)}</td><td>x</td><td class="text-end">${fmt(datos.deducciones.refAg.resultado)}</td><td>$/Oz</td><td class="text-end">${fmt(datos.deducciones.refAg.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Escalador Ag</strong></td><td>-</td><td></td><td class="text-end">${fmt(datos.deducciones.escaladorAg.resultado)}</td><td>$/TMS</td><td class="text-end">${fmt(datos.deducciones.escaladorAg.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Refinación Au</strong></td><td class="text-end">${fmt(datos.pagos.oro.contenido)}</td><td>x</td><td class="text-end">${fmt(datos.deducciones.refAu.resultado)}</td><td>$/Oz</td><td class="text-end">${fmt(datos.deducciones.refAu.resultado)}</td></tr>
        </tbody>
    </table>

    <!-- TABLA PENALIDADES -->
    <table>
        <thead><tr class="table-secondary"><th colspan="6">PENALIDADES</th></tr>
        <tr class="table-secondary"><th>Concepto</th><th>Valor</th><th>Libre</th><th>Por cada</th><th>Unidades</th><th>Resultado</th></tr></thead>
        <tbody>
            <tr><td class="text-start"><strong>As</strong></td><td class="text-end">${fmt(datos.deducciones.penalidadAs.valor)}%</td><td class="text-end">0.2%</td><td class="text-end">0.1%</td><td class="text-end">${fmt(datos.deducciones.penalidadAs.unidades)}</td><td class="text-end">${fmt(datos.deducciones.penalidadAs.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Sb</strong></td><td class="text-end">${fmt(datos.deducciones.penalidadSb.valor)}%</td><td class="text-end">0.3%</td><td class="text-end">0.1%</td><td class="text-end">${fmt(datos.deducciones.penalidadSb.unidades)}</td><td class="text-end">${fmt(datos.deducciones.penalidadSb.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Bi</strong></td><td class="text-end">${fmt(datos.deducciones.penalidadBi.valor)}%</td><td class="text-end">0.05%</td><td class="text-end">0.01%</td><td class="text-end">${fmt(datos.deducciones.penalidadBi.unidades)}</td><td class="text-end">${fmt(datos.deducciones.penalidadBi.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Zn</strong></td><td class="text-end">${fmt(datos.deducciones.penalidadZn.valor)}%</td><td class="text-end">3%</td><td class="text-end">1%</td><td class="text-end">${fmt(datos.deducciones.penalidadZn.unidades)}</td><td class="text-end">${fmt(datos.deducciones.penalidadZn.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Hg</strong></td><td class="text-end">${fmt(datos.deducciones.penalidadHg.valor)} ppm</td><td class="text-end">30 ppm</td><td class="text-end">10 ppm</td><td class="text-end">${fmt(datos.deducciones.penalidadHg.unidades)}</td><td class="text-end">${fmt(datos.deducciones.penalidadHg.resultado)}</td></tr>
            <tr><td class="text-start"><strong>H2O</strong></td><td class="text-end">${fmt(datos.deducciones.penalidadH2O.valor)}%</td><td class="text-end">10%</td><td class="text-end">1%</td><td class="text-end">${fmt(datos.deducciones.penalidadH2O.unidades)}</td><td class="text-end">${fmt(datos.deducciones.penalidadH2O.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Servicios</strong></td><td>-</td><td>-</td><td>-</td><td>-</td><td class="text-end">${fmt(datos.deducciones.analisis)}</td></tr>
        </tbody>
    </table>

    <!-- TABLA TOTALES -->
    <table>
        <tbody>
            <tr class="table-warning"><td colspan="5"><strong>TOTAL DE DEDUCCIONES</strong></td><td class="text-end fw-bold">${fmt(datos.totales.deducciones)}</td></tr>
            <tr class="table-success"><td colspan="5"><strong>TOTAL /TM (US $/TMS)</strong></td><td class="text-end fw-bold">${fmt(datos.totales.valorPorTMS)}</td></tr>
            <tr><td colspan="3"><strong>IGV %</strong></td><td colspan="3">${fmt(datos.totales.igv)}%</td></tr>
            <tr class="table-primary"><td colspan="5"><strong>TOTAL POR LOTE (US $)</strong></td><td class="text-end"><strong>$${fmt(datos.totales.valorPorTMS * (parseFloat(document.getElementById('tmh').value) || 0) * (1 - ((parseFloat(document.getElementById('humedad').value) || 0) + (parseFloat(document.getElementById('merma').value) || 0)) / 100) * (1 + datos.totales.igv / 100))}</strong></td></tr>
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