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
    
    const igvSpan = document.getElementById('igvPorcentaje');
    if (igvSpan) igvSpan.innerText = igv;
    
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
    
    // Actualizar tabla pagos
    const pagoCuFactorSpan = document.getElementById('pagoCuFactor');
    const pagoCuValorSpan = document.getElementById('pagoCuValor');
    const pagoCuResultadoSpan = document.getElementById('pagoCuResultado');
    if (pagoCuFactorSpan) pagoCuFactorSpan.innerHTML = factorCu.toFixed(6);
    if (pagoCuValorSpan) pagoCuValorSpan.innerHTML = precioCuTm.toLocaleString('en-US', {minimumFractionDigits: 3});
    if (pagoCuResultadoSpan) pagoCuResultadoSpan.innerHTML = pagoCuResultado.toLocaleString('en-US', {minimumFractionDigits: 3});
    
    const pagoAuFactorSpan = document.getElementById('pagoAuFactor');
    const pagoAuValorSpan = document.getElementById('pagoAuValor');
    const pagoAuResultadoSpan = document.getElementById('pagoAuResultado');
    if (pagoAuFactorSpan) pagoAuFactorSpan.innerHTML = pagoAuFactor.toFixed(6);
    if (pagoAuValorSpan) pagoAuValorSpan.innerHTML = precioAuOz.toFixed(2);
    if (pagoAuResultadoSpan) pagoAuResultadoSpan.innerHTML = pagoAuResultado.toLocaleString('en-US', {minimumFractionDigits: 3});
    
    const pagoAgFactorSpan = document.getElementById('pagoAgFactor');
    const pagoAgValorSpan = document.getElementById('pagoAgValor');
    const pagoAgResultadoSpan = document.getElementById('pagoAgResultado');
    if (pagoAgFactorSpan) pagoAgFactorSpan.innerHTML = pagoAgFactor.toFixed(6);
    if (pagoAgValorSpan) pagoAgValorSpan.innerHTML = precioAgOz.toFixed(2);
    if (pagoAgResultadoSpan) pagoAgResultadoSpan.innerHTML = pagoAgResultado.toLocaleString('en-US', {minimumFractionDigits: 3});
    
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
    
    const dedMaquilaValorSpan = document.getElementById('dedMaquilaValor');
    const dedMaquilaResultadoSpan = document.getElementById('dedMaquilaResultado');
    if (dedMaquilaValorSpan) dedMaquilaValorSpan.innerHTML = dedMaquilaResultado.toFixed(2);
    if (dedMaquilaResultadoSpan) dedMaquilaResultadoSpan.innerHTML = dedMaquilaResultado.toLocaleString('en-US', {minimumFractionDigits: 3});
    
    const refCuFactorSpan = document.getElementById('refCuFactor');
    const refCuValorSpan = document.getElementById('refCuValor');
    const refCuResultadoSpan = document.getElementById('refCuResultado');
    if (refCuFactorSpan) refCuFactorSpan.innerHTML = refCuFactor.toFixed(6);
    if (refCuValorSpan) refCuValorSpan.innerHTML = refCuValor.toLocaleString('en-US', {minimumFractionDigits: 3});
    if (refCuResultadoSpan) refCuResultadoSpan.innerHTML = refCuResultado.toLocaleString('en-US', {minimumFractionDigits: 3});
    
    const refAuFactorSpan = document.getElementById('refAuFactor');
    const refAuValorSpan = document.getElementById('refAuValor');
    const refAuResultadoSpan = document.getElementById('refAuResultado');
    if (refAuFactorSpan) refAuFactorSpan.innerHTML = refAuFactor.toFixed(6);
    if (refAuValorSpan) refAuValorSpan.innerHTML = refAuValor.toFixed(2);
    if (refAuResultadoSpan) refAuResultadoSpan.innerHTML = refAuResultado.toLocaleString('en-US', {minimumFractionDigits: 3});
    
    const refAgFactorSpan = document.getElementById('refAgFactor');
    const refAgValorSpan = document.getElementById('refAgValor');
    const refAgResultadoSpan = document.getElementById('refAgResultado');
    if (refAgFactorSpan) refAgFactorSpan.innerHTML = refAgFactor.toFixed(6);
    if (refAgValorSpan) refAgValorSpan.innerHTML = refAgValor.toFixed(2);
    if (refAgResultadoSpan) refAgResultadoSpan.innerHTML = refAgResultado.toLocaleString('en-US', {minimumFractionDigits: 3});
    
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
    
    const penalidadAsSbValorSpan = document.getElementById('penalidadAsSbValorMostrar');
    const penalidadAsSbUnidadesSpan = document.getElementById('penalidadAsSbUnidades');
    const penalidadAsSbResultadoSpan = document.getElementById('penalidadAsSbResultado');
    if (penalidadAsSbValorSpan) penalidadAsSbValorSpan.innerHTML = asSb.toFixed(3);
    if (penalidadAsSbUnidadesSpan) penalidadAsSbUnidadesSpan.innerHTML = penalidadAsSbUnidades.toFixed(4);
    if (penalidadAsSbResultadoSpan) penalidadAsSbResultadoSpan.innerHTML = penalidadAsSb.toLocaleString('en-US', {minimumFractionDigits: 3});
    
    const penalidadPbZnValorSpan = document.getElementById('penalidadPbZnValorMostrar');
    const penalidadPbZnUnidadesSpan = document.getElementById('penalidadPbZnUnidades');
    const penalidadPbZnResultadoSpan = document.getElementById('penalidadPbZnResultado');
    if (penalidadPbZnValorSpan) penalidadPbZnValorSpan.innerHTML = pbZn.toFixed(3);
    if (penalidadPbZnUnidadesSpan) penalidadPbZnUnidadesSpan.innerHTML = penalidadPbZnUnidades.toFixed(4);
    if (penalidadPbZnResultadoSpan) penalidadPbZnResultadoSpan.innerHTML = penalidadPbZn.toLocaleString('en-US', {minimumFractionDigits: 3});
    
    const penalidadBiValorSpan = document.getElementById('penalidadBiValorMostrar');
    const penalidadBiUnidadesSpan = document.getElementById('penalidadBiUnidades');
    const penalidadBiResultadoSpan = document.getElementById('penalidadBiResultado');
    if (penalidadBiValorSpan) penalidadBiValorSpan.innerHTML = bi.toFixed(3);
    if (penalidadBiUnidadesSpan) penalidadBiUnidadesSpan.innerHTML = penalidadBiUnidades.toFixed(4);
    if (penalidadBiResultadoSpan) penalidadBiResultadoSpan.innerHTML = penalidadBi.toLocaleString('en-US', {minimumFractionDigits: 3});
    
    const penalidadHgValorSpan = document.getElementById('penalidadHgValorMostrar');
    const penalidadHgUnidadesSpan = document.getElementById('penalidadHgUnidades');
    const penalidadHgResultadoSpan = document.getElementById('penalidadHgResultado');
    if (penalidadHgValorSpan) penalidadHgValorSpan.innerHTML = hg.toFixed(3);
    if (penalidadHgUnidadesSpan) penalidadHgUnidadesSpan.innerHTML = penalidadHgUnidades.toFixed(4);
    if (penalidadHgResultadoSpan) penalidadHgResultadoSpan.innerHTML = penalidadHg.toLocaleString('en-US', {minimumFractionDigits: 3});
    
    const analisisResultadoSpan = document.getElementById('analisisResultado');
    if (analisisResultadoSpan) analisisResultadoSpan.innerHTML = analisisResultado.toLocaleString('en-US', {minimumFractionDigits: 3});
    
    // TOTALES
    const totalDeducciones = dedMaquilaResultado + refCuResultado + refAuResultado + penalidadAsSb + penalidadPbZn + penalidadBi + penalidadHg + analisisResultado;
    const totalDeduccionesSpan = document.getElementById('totalDeducciones');
    if (totalDeduccionesSpan) totalDeduccionesSpan.innerHTML = totalDeducciones.toLocaleString('en-US', {minimumFractionDigits: 3});
    
    const valorPorTMS = subtotalPagos - totalDeducciones;
    const valorPorTMSSpan = document.getElementById('valorPorTMS');
    if (valorPorTMSSpan) valorPorTMSSpan.innerHTML = valorPorTMS.toLocaleString('en-US', {minimumFractionDigits: 3});
    
    const factorHumedadMerma = 1 - (humedad + merma) / 100;
    const factorIGV = 1 + igv / 100;
    const valorTotalConIGV = valorPorTMS * tmh * factorHumedadMerma * factorIGV;
    const valorTotalConIGVSpan = document.getElementById('valorTotalConIGV');
    if (valorTotalConIGVSpan) valorTotalConIGVSpan.innerHTML = `$${valorTotalConIGV.toLocaleString('en-US', {minimumFractionDigits: 3})}`;
    
    mostrarMensaje(`Valorizacion calculada para ${nombreCliente}: $${valorTotalConIGV.toLocaleString()} USD`);
}

// Función para generar PDF con datos en memoria
function generarPDF() {
    // Obtener todos los datos en memoria
    const datos = {
        cliente: document.getElementById('nombreCliente').value || 'Anonimo',
        fecha: new Date().toLocaleString(),
        pagos: {
            cobre: { factor: document.getElementById('pagoCuFactor').innerHTML, valor: document.getElementById('pagoCuValor').innerHTML, resultado: document.getElementById('pagoCuResultado').innerHTML },
            oro: { factor: document.getElementById('pagoAuFactor').innerHTML, valor: document.getElementById('pagoAuValor').innerHTML, resultado: document.getElementById('pagoAuResultado').innerHTML },
            plata: { factor: document.getElementById('pagoAgFactor').innerHTML, valor: document.getElementById('pagoAgValor').innerHTML, resultado: document.getElementById('pagoAgResultado').innerHTML }
        },
        deducciones: {
            maquila: { valor: document.getElementById('dedMaquilaValor').innerHTML, resultado: document.getElementById('dedMaquilaResultado').innerHTML },
            refCu: { factor: document.getElementById('refCuFactor').innerHTML, valor: document.getElementById('refCuValor').innerHTML, resultado: document.getElementById('refCuResultado').innerHTML },
            refAu: { factor: document.getElementById('refAuFactor').innerHTML, valor: document.getElementById('refAuValor').innerHTML, resultado: document.getElementById('refAuResultado').innerHTML },
            refAg: { factor: document.getElementById('refAgFactor').innerHTML, valor: document.getElementById('refAgValor').innerHTML, resultado: document.getElementById('refAgResultado').innerHTML }
        },
        penalidades: {
            asSb: { valor: document.getElementById('penalidadAsSbValorMostrar').innerHTML, unidades: document.getElementById('penalidadAsSbUnidades').innerHTML, resultado: document.getElementById('penalidadAsSbResultado').innerHTML },
            pbZn: { valor: document.getElementById('penalidadPbZnValorMostrar').innerHTML, unidades: document.getElementById('penalidadPbZnUnidades').innerHTML, resultado: document.getElementById('penalidadPbZnResultado').innerHTML },
            bi: { valor: document.getElementById('penalidadBiValorMostrar').innerHTML, unidades: document.getElementById('penalidadBiUnidades').innerHTML, resultado: document.getElementById('penalidadBiResultado').innerHTML },
            hg: { valor: document.getElementById('penalidadHgValorMostrar').innerHTML, unidades: document.getElementById('penalidadHgUnidades').innerHTML, resultado: document.getElementById('penalidadHgResultado').innerHTML },
            analisis: document.getElementById('analisisResultado').innerHTML
        },
        totales: {
            deducciones: document.getElementById('totalDeducciones').innerHTML,
            valorPorTMS: document.getElementById('valorPorTMS').innerHTML,
            igv: document.getElementById('igvPorcentaje').innerHTML,
            totalLote: document.getElementById('valorTotalConIGV').innerHTML
        }
    };
    
    // Crear HTML para el PDF
    const htmlContent = `<!DOCTYPE html>
    <html>
    <head>
        <title>Valorizacion Concentrado de Cobre - ${datos.cliente}</title>
        <meta charset="UTF-8">
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
            @media print { body { margin: 0; padding: 10px; } }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>MINERA STORE - COMER MINING</h2>
            <h3>Valorizacion de Concentrado de Cobre</h3>
            <p><strong>Cliente:</strong> ${datos.cliente} | <strong>Fecha:</strong> ${datos.fecha}</p>
            <hr>
        </div>
        
        <table>
            <thead><tr class="table-secondary"><th colspan="6">PAGOS</th></tr>
            <tr class="table-secondary"><th>Concepto</th><th>Factor</th><th>Operador</th><th>Valor</th><th>Unidad</th><th>Resultado ($/TMS)</th></tr></thead>
            <tbody>
                <tr><td class="text-start"><strong>COBRE (Cu)</strong></td><td class="text-end">${datos.pagos.cobre.factor}</td><td>x</td><td class="text-end">${datos.pagos.cobre.valor}</td><td>$/TM</td><td class="text-end fw-bold">${datos.pagos.cobre.resultado}</td></tr>
                <tr><td class="text-start"><strong>ORO (Au)</strong></td><td class="text-end">${datos.pagos.oro.factor}</td><td>x</td><td class="text-end">${datos.pagos.oro.valor}</td><td>$/Oz</td><td class="text-end fw-bold">${datos.pagos.oro.resultado}</td></tr>
                <tr><td class="text-start"><strong>PLATA (Ag)</strong></td><td class="text-end">${datos.pagos.plata.factor}</td><td>x</td><td class="text-end">${datos.pagos.plata.valor}</td><td>$/Oz</td><td class="text-end fw-bold">${datos.pagos.plata.resultado}</td></tr>
            </tbody>
        </table>
        
        <table>
            <thead><tr class="table-secondary"><th colspan="6">DEDUCCIONES</th></tr>
            <tr class="table-secondary"><th>Concepto</th><th>Factor</th><th>Operador</th><th>Valor</th><th>Unidad</th><th>Resultado ($/TMS)</th></tr></thead>
            <tbody>
                <tr><td class="text-start"><strong>Maquila</strong></td><td>-</td><td></td><td class="text-end">${datos.deducciones.maquila.valor}</td><td>$/TMS</td><td class="text-end">${datos.deducciones.maquila.resultado}</td></tr>
                <tr><td class="text-start"><strong>Gastos Refinacion Cu</strong></td><td class="text-end">${datos.deducciones.refCu.factor}</td><td>x</td><td class="text-end">${datos.deducciones.refCu.valor}</td><td>$/TM</td><td class="text-end">${datos.deducciones.refCu.resultado}</td></tr>
                <tr><td class="text-start"><strong>Gastos Refinacion Au</strong></td><td class="text-end">${datos.deducciones.refAu.factor}</td><td>x</td><td class="text-end">${datos.deducciones.refAu.valor}</td><td>$/Oz</td><td class="text-end">${datos.deducciones.refAu.resultado}</td></tr>
                <tr><td class="text-start"><strong>Gastos Refinacion Ag</strong></td><td class="text-end">${datos.deducciones.refAg.factor}</td><td>x</td><td class="text-end">${datos.deducciones.refAg.valor}</td><td>$/Oz</td><td class="text-end">${datos.deducciones.refAg.resultado}</td></tr>
            </tbody>
        </table>
        
        <table>
            <thead><tr class="table-secondary"><th colspan="7">PENALIDADES</th></tr>
            <tr class="table-secondary"><th>Concepto</th><th>Valor</th><th>Libre</th><th>Por cada</th><th>Penalidad</th><th>Unidades</th><th>Resultado</th></tr></thead>
            <tbody>
                <tr><td class="text-start"><strong>As+Sb</strong></td><td class="text-end">${datos.penalidades.asSb.valor}%</td><td class="text-end">0.3%</td><td class="text-end">0.1%</td><td class="text-end">$3.50</td><td class="text-end">${datos.penalidades.asSb.unidades}</td><td class="text-end">${datos.penalidades.asSb.resultado}</td></tr>
                <tr><td class="text-start"><strong>Pb+Zn</strong></td><td class="text-end">${datos.penalidades.pbZn.valor}%</td><td class="text-end">5.0%</td><td class="text-end">0.5%</td><td class="text-end">$5.00</td><td class="text-end">${datos.penalidades.pbZn.unidades}</td><td class="text-end">${datos.penalidades.pbZn.resultado}</td></tr>
                <tr><td class="text-start"><strong>Bi</strong></td><td class="text-end">${datos.penalidades.bi.valor}%</td><td class="text-end">0.05%</td><td class="text-end">0.01%</td><td class="text-end">$6.00</td><td class="text-end">${datos.penalidades.bi.unidades}</td><td class="text-end">${datos.penalidades.bi.resultado}</td></tr>
                <tr><td class="text-start"><strong>Hg</strong></td><td class="text-end">${datos.penalidades.hg.valor} ppm</td><td class="text-end">20 ppm</td><td class="text-end">10 ppm</td><td class="text-end">$7.00</td><td class="text-end">${datos.penalidades.hg.unidades}</td><td class="text-end">${datos.penalidades.hg.resultado}</td></tr>
                <tr><td class="text-start"><strong>Servicios (Analisis)</strong></td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td class="text-end">${datos.penalidades.analisis}</td></tr>
            </tbody>
        </table>
        
        <table>
            <tbody>
                <tr class="table-warning"><td colspan="5"><strong>TOTAL DE DEDUCCIONES</strong></td><td class="text-end fw-bold">${datos.totales.deducciones}</td></tr>
                <tr class="table-success"><td colspan="5"><strong>TOTAL /TM (US $/TMS)</strong></td><td class="text-end fw-bold">${datos.totales.valorPorTMS}</td></tr>
                <tr><td colspan="3"><strong>IGV %</strong></td><td colspan="3">${datos.totales.igv}%</td></tr>
                <tr class="table-primary"><td colspan="5"><strong>TOTAL POR LOTE (US $)</strong></td><td class="text-end"><strong>${datos.totales.totalLote}</strong></td></tr>
            </tbody>
        </table>
        
        <div class="footer"><hr>Documento generado por MINERA STORE - Todos los derechos reservados.</div>
    </body>
    </html>`;
    
    // Crear un elemento temporal y generar PDF
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    document.body.appendChild(element);
    
    const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `Valorizacion_Cobre_${datos.cliente.replace(/ /g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, letterRendering: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(element).save().then(function() {
        document.body.removeChild(element);
        mostrarMensaje('PDF generado correctamente');
    }).catch(function(error) {
        document.body.removeChild(element);
        mostrarMensaje('Error al generar el PDF');
        console.error(error);
    });
}

// Event listeners
document.getElementById('tmh')?.addEventListener('input', function() {
    actualizarTMSNeto();
    calcularValorizacionCompleta();
});
document.getElementById('humedad')?.addEventListener('input', function() {
    actualizarTMSNeto();
    calcularValorizacionCompleta();
});
document.getElementById('merma')?.addEventListener('input', function() {
    actualizarTMSNeto();
    calcularValorizacionCompleta();
});

var camposEditable = ['leyCu', 'leyAu', 'leyAg', 'precioCu', 'precioAu', 'precioAg', 
    'contAs', 'contSb', 'contBi', 'contZn', 'contPb', 'contHg', 'igv', 'analisisQuimico'];
for (var i = 0; i < camposEditable.length; i++) {
    var elemento = document.getElementById(camposEditable[i]);
    if (elemento) {
        elemento.addEventListener('input', calcularValorizacionCompleta);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    actualizarTMSNeto();
    calcularValorizacionCompleta();
});