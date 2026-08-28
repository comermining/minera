// ==================== CONCENTRADO DE COBRE - VALORIZACIÓN ====================
// Términos comerciales
const terminos = {
    pagableCu: 100, deduccionCu: 1.25, gastosRefCu: 0.12, proteccionCu: 0.05,
    pagableAg: 90, deduccionAg: 2.50, gastosRefAg: 5.00,
    pagableAu: 90, deduccionAu: 0.08, gastosRefAu: 12.00,
    maquila: 115.00, proteccionGeneral: 0.03
};

// Constantes
const LB_POR_TM = 2204.62;
const TC_A_TM_FACTOR = 1.1023;
const OZ_POR_G = 31.1035;

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
    // Obtener datos de entrada
    const nombreCliente = document.getElementById('nombreCliente').value || 'Anónimo';
    const leyCu = parseFloat(document.getElementById('leyCu').value) || 0;
    const leyAuOzTC = parseFloat(document.getElementById('leyAu').value) || 0;
    const leyAgOzTC = parseFloat(document.getElementById('leyAg').value) || 0;
    
    const precioCuLb = parseFloat(document.getElementById('precioCu').value) || 0;
    const precioAuOz = parseFloat(document.getElementById('precioAu').value) || 0;
    const precioAgOz = parseFloat(document.getElementById('precioAg').value) || 0;
    
    const tmh = parseFloat(document.getElementById('tmh').value) || 0;
    const humedad = parseFloat(document.getElementById('humedad').value) || 0;
    const merma = parseFloat(document.getElementById('merma').value) || 0;
    const igv = parseFloat(document.getElementById('igv').value) || 18;
    const analisisQuimico = parseFloat(document.getElementById('analisisQuimico').value) || 0;
    
    const as = parseFloat(document.getElementById('contAs').value) || 0;
    const sb = parseFloat(document.getElementById('contSb').value) || 0;
    const bi = parseFloat(document.getElementById('contBi').value) || 0;
    const zn = parseFloat(document.getElementById('contZn').value) || 0;
    const pb = parseFloat(document.getElementById('contPb').value) || 0;
    const hg = parseFloat(document.getElementById('contHg').value) || 0;
    
    const asSb = as + sb;
    const pbZn = pb + zn;

    // PAGOS
    const factorCu = (leyCu - terminos.deduccionCu);
    const precioCuNeto = (precioCuLb - terminos.proteccionGeneral);
    const precioCuTm = precioCuNeto / 0.000453592;
    const pagoCuResultado = (factorCu * precioCuTm) / 100;
    
    const leyAuOzTM = leyAuOzTC * TC_A_TM_FACTOR;
    const deduccionAuOzTM = terminos.deduccionAu / OZ_POR_G;
    const leyAuPagableBase = (leyAuOzTM - deduccionAuOzTM);
    const pagoAuFactor = leyAuPagableBase * (terminos.pagableAu / 100);
    const pagoAuResultado = pagoAuFactor * precioAuOz;
    
    const leyAgOzTM = leyAgOzTC * TC_A_TM_FACTOR;
    const leyAgPagableBase = (leyAgOzTM - terminos.deduccionAg);
    const pagoAgFactor = leyAgPagableBase * (terminos.pagableAg / 100);
    const pagoAgResultado = pagoAgFactor * precioAgOz;
    
    const subtotalPagos = pagoCuResultado + pagoAuResultado + pagoAgResultado;

    // DEDUCCIONES
    const dedMaquilaResultado = terminos.maquila;
    const refCuFactor = factorCu / 100;
    const refCuValor = 264.555;
    const refCuResultado = refCuFactor * refCuValor;
    const refAuFactor = pagoAuFactor;
    const refAuValor = terminos.gastosRefAu;
    const refAuResultado = refAuFactor * refAuValor;
    const refAgFactor = pagoAgFactor;
    const refAgValor = terminos.gastosRefAg;
    const refAgResultado = refAgFactor * refAgValor;

    // PENALIDADES
    const penalidadAsSbUnidades = calcularPenalidadUnidades(asSb, 0.3, 0.1);
    const penalidadAsSb = penalidadAsSbUnidades * 3.5;
    const penalidadPbZnUnidades = calcularPenalidadUnidades(pbZn, 5.0, 0.5);
    const penalidadPbZn = penalidadPbZnUnidades * 5.0;
    const penalidadBiUnidades = calcularPenalidadUnidades(bi, 0.05, 0.01);
    const penalidadBi = penalidadBiUnidades * 6.0;
    const penalidadHgUnidades = calcularPenalidadUnidades(hg, 20, 10);
    const penalidadHg = penalidadHgUnidades * 7.0;
    const analisisResultado = analisisQuimico;

    // TOTALES
    const totalDeducciones = dedMaquilaResultado + refCuResultado + refAuResultado + penalidadAsSb + penalidadPbZn + penalidadBi + penalidadHg + analisisResultado;
    const valorPorTMS = subtotalPagos - totalDeducciones;

    // Retornar el objeto de datos (sin tocar el DOM)
    return {
        pagos: {
            cobre: { factor: factorCu, valor: precioCuTm, resultado: pagoCuResultado },
            oro:   { factor: pagoAuFactor, valor: precioAuOz, resultado: pagoAuResultado },
            plata: { factor: pagoAgFactor, valor: precioAgOz, resultado: pagoAgResultado }
        },
        deducciones: {
            maquila: { resultado: dedMaquilaResultado },
            refCu:   { factor: refCuFactor, valor: refCuValor, resultado: refCuResultado },
            refAu:   { factor: refAuFactor, valor: refAuValor, resultado: refAuResultado },
            refAg:   { factor: refAgFactor, valor: refAgValor, resultado: refAgResultado }
        },
        penalidades: {
            asSb:  { valor: asSb, unidades: penalidadAsSbUnidades, resultado: penalidadAsSb },
            pbZn:  { valor: pbZn, unidades: penalidadPbZnUnidades, resultado: penalidadPbZn },
            bi:    { valor: bi, unidades: penalidadBiUnidades, resultado: penalidadBi },
            hg:    { valor: hg, unidades: penalidadHgUnidades, resultado: penalidadHg },
            analisis: analisisResultado
        },
        totales: {
            deducciones: totalDeducciones,
            valorPorTMS: valorPorTMS,
            igv: igv
        }
    };
}

function generarPDF() {
    // 1. Obtener datos
    const nombreCliente = document.getElementById('nombreCliente').value || 'Anónimo';
    const fecha = new Date().toLocaleString();
    const datos = calcularValorizacionCompleta();

    // Funciones auxiliares para formatear números
    const fmt = (num) => {
        return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    const fmtFactor = (num) => {
        return Number(num).toFixed(4);
    };

    // 2. Construir el HTML COMPLETO del PDF
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Valorización de Cobre</title>
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
        <h3>Valorizacion de Concentrado de Cobre</h3>
        <p><strong>Cliente:</strong> ${nombreCliente} | <strong>Fecha:</strong> ${fecha}</p>
        <hr>
    </div>

    <!-- TABLA PAGOS -->
    <table>
        <thead><tr class="table-secondary"><th colspan="6">PAGOS</th></tr>
        <tr class="table-secondary"><th>Concepto</th><th>Factor</th><th>Operador</th><th>Valor</th><th>Unidad</th><th>Resultado ($/TMS)</th></tr></thead>
        <tbody>
            <tr><td class="text-start"><strong>COBRE (Cu)</strong></td><td class="text-end">${fmtFactor(datos.pagos.cobre.factor)}</td><td>x</td><td class="text-end">${fmt(datos.pagos.cobre.valor)}</td><td>$/TM</td><td class="text-end fw-bold">${fmt(datos.pagos.cobre.resultado)}</td></tr>
            <tr><td class="text-start"><strong>ORO (Au)</strong></td><td class="text-end">${fmtFactor(datos.pagos.oro.factor)}</td><td>x</td><td class="text-end">${fmt(datos.pagos.oro.valor)}</td><td>$/Oz</td><td class="text-end fw-bold">${fmt(datos.pagos.oro.resultado)}</td></tr>
            <tr><td class="text-start"><strong>PLATA (Ag)</strong></td><td class="text-end">${fmtFactor(datos.pagos.plata.factor)}</td><td>x</td><td class="text-end">${fmt(datos.pagos.plata.valor)}</td><td>$/Oz</td><td class="text-end fw-bold">${fmt(datos.pagos.plata.resultado)}</td></tr>
        </tbody>
    </table>

    <!-- TABLA DEDUCCIONES -->
    <table>
        <thead><tr class="table-secondary"><th colspan="6">DEDUCCIONES</th></tr>
        <tr class="table-secondary"><th>Concepto</th><th>Factor</th><th>Operador</th><th>Valor</th><th>Unidad</th><th>Resultado ($/TMS)</th></tr></thead>
        <tbody>
            <tr><td class="text-start"><strong>Maquila</strong></td><td>-</td><td></td><td class="text-end">${fmt(datos.deducciones.maquila.resultado)}</td><td>$/TMS</td><td class="text-end">${fmt(datos.deducciones.maquila.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Gastos Refinacion Cu</strong></td><td class="text-end">${fmtFactor(datos.deducciones.refCu.factor)}</td><td>x</td><td class="text-end">${fmt(datos.deducciones.refCu.valor)}</td><td>$/TM</td><td class="text-end">${fmt(datos.deducciones.refCu.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Gastos Refinacion Au</strong></td><td class="text-end">${fmtFactor(datos.deducciones.refAu.factor)}</td><td>x</td><td class="text-end">${fmt(datos.deducciones.refAu.valor)}</td><td>$/Oz</td><td class="text-end">${fmt(datos.deducciones.refAu.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Gastos Refinacion Ag</strong></td><td class="text-end">${fmtFactor(datos.deducciones.refAg.factor)}</td><td>x</td><td class="text-end">${fmt(datos.deducciones.refAg.valor)}</td><td>$/Oz</td><td class="text-end">${fmt(datos.deducciones.refAg.resultado)}</td></tr>
        </tbody>
    </table>

    <!-- TABLA PENALIDADES -->
    <table>
        <thead><tr class="table-secondary"><th colspan="7">PENALIDADES</th></tr>
        <tr class="table-secondary"><th>Concepto</th><th>Valor</th><th>Libre</th><th>Por cada</th><th>Penalidad</th><th>Unidades</th><th>Resultado</th></tr></thead>
        <tbody>
            <tr><td class="text-start"><strong>As+Sb</strong></td><td class="text-end">${fmt(datos.penalidades.asSb.valor)}%</td><td class="text-end">0.3%</td><td class="text-end">0.1%</td><td class="text-end">$3.50</td><td class="text-end">${fmt(datos.penalidades.asSb.unidades)}</td><td class="text-end">${fmt(datos.penalidades.asSb.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Pb+Zn</strong></td><td class="text-end">${fmt(datos.penalidades.pbZn.valor)}%</td><td class="text-end">5.0%</td><td class="text-end">0.5%</td><td class="text-end">$5.00</td><td class="text-end">${fmt(datos.penalidades.pbZn.unidades)}</td><td class="text-end">${fmt(datos.penalidades.pbZn.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Bi</strong></td><td class="text-end">${fmt(datos.penalidades.bi.valor)}%</td><td class="text-end">0.05%</td><td class="text-end">0.01%</td><td class="text-end">$6.00</td><td class="text-end">${fmt(datos.penalidades.bi.unidades)}</td><td class="text-end">${fmt(datos.penalidades.bi.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Hg</strong></td><td class="text-end">${fmt(datos.penalidades.hg.valor)} ppm</td><td class="text-end">20 ppm</td><td class="text-end">10 ppm</td><td class="text-end">$7.00</td><td class="text-end">${fmt(datos.penalidades.hg.unidades)}</td><td class="text-end">${fmt(datos.penalidades.hg.resultado)}</td></tr>
            <tr><td class="text-start"><strong>Servicios (Análisis)</strong></td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td class="text-end">${fmt(datos.penalidades.analisis)}</td></tr>
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

    // 3. Crear un div fuera de pantalla (renderizable por html2canvas)
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

    // 4. Esperar y generar el PDF
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
            
            // === CONFIGURACIÓN PARA UNA SOLA PÁGINA ===
            const margin = 5; // Margen en milímetros
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Área útil dentro de la página (descontando márgenes)
            const printableWidth = pageWidth - (2 * margin);
            const printableHeight = pageHeight - (2 * margin);

            // Calcular la escala para que la imagen quepa COMPLETA en una sola página
            const scaleX = printableWidth / canvas.width;
            const scaleY = printableHeight / canvas.height;
            const scale = Math.min(scaleX, scaleY); // Usa la escala más pequeña para que no se corte

            // Nuevas dimensiones escaladas
            const imgWidth = canvas.width * scale;
            const imgHeight = canvas.height * scale;

            // Dibujar en la única página (centrado horizontal y verticalmente)
            pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);

            // Abrir el PDF en el navegador
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