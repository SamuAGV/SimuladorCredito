document.getElementById('btn-cotizar').addEventListener('click', calcularCredito);
document.getElementById('btn-limpiar').addEventListener('click', limpiarFormulario);
document.getElementById('btn-ver-tabla').addEventListener('click', toggleTabla);

let datosOriginales = null;
let prepagosGuardados = [];

function calcularCredito() {
  const nombre = document.getElementById('nombre').value;
  const montoAutorizado = parseFloat(document.getElementById('montoAutorizado').value);
  const comisionPorcentaje = parseFloat(document.getElementById('comisionPorcentaje').value);
  const plazoMeses = parseInt(document.getElementById('plazo').value);
  const tasaAnual = parseFloat(document.getElementById('tasa').value);
  const cat = parseFloat(document.getElementById('cat').value);

  // Validaciones
  if (!nombre || nombre.trim() === "") {
    alert("Por favor, ingrese el nombre del cliente");
    return;
  }
  
  if (isNaN(montoAutorizado) || montoAutorizado <= 0) {
    alert("Por favor, ingrese un monto autorizado valido");
    return;
  }
  
  if (isNaN(comisionPorcentaje) || comisionPorcentaje < 0) {
    alert("Por favor, ingrese el porcentaje de comision");
    return;
  }
  
  if (isNaN(plazoMeses) || plazoMeses <= 0) {
    alert("Por favor, seleccione el plazo del credito");
    return;
  }
  
  if (isNaN(tasaAnual) || tasaAnual <= 0) {
    alert("Por favor, ingrese la tasa de interes anual");
    return;
  }

  // Calcular comision base e IVA
  const comisionBase = (montoAutorizado * comisionPorcentaje) / 100;
  const ivaComision = comisionBase * 0.16;
  const comisionConIVA = comisionBase + ivaComision;
  
  const totalFinanciar = montoAutorizado + comisionConIVA;
  const tasaMensual = tasaAnual / 100 / 12;
  const pagoFijoMensual = totalFinanciar / plazoMeses;
  
  const primerInteres = totalFinanciar * tasaMensual;
  const primerIVAInteres = primerInteres * 0.16;
  const primerPagoTotal = pagoFijoMensual + primerInteres + primerIVAInteres;
  const pagoPorMil = primerPagoTotal / (totalFinanciar / 1000);

  document.getElementById('comisionMonto').innerHTML = `$${comisionConIVA.toFixed(2)}`;
  document.getElementById('totalFinanciar').innerHTML = `$${totalFinanciar.toFixed(2)}`;
  document.getElementById('pagoPorMil').innerHTML = `$${pagoPorMil.toFixed(2)}`;

  datosOriginales = {
    totalFinanciar,
    plazoMeses,
    tasaMensual,
    pagoFijoMensual,
    nombre,
    montoAutorizado,
    comisionConIVA,
    tasaAnual,
    cat
  };
  
  window.datosCredito = { ...datosOriginales };
  
  // Limpiar prepagos anteriores
  prepagosGuardados = [];
}

function toggleTabla() {
  const container = document.getElementById('tabla-container');
  if (container.style.display === 'none') {
    if (!window.datosCredito) {
      alert("Primero presione 'Cotizar' para generar la simulacion");
      return;
    }
    generarTablaConPrepagos();
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
}

function generarTablaConPrepagos() {
  let { totalFinanciar, plazoMeses, tasaMensual, pagoFijoMensual } = window.datosCredito;
  let saldoCapital = totalFinanciar;
  const tbody = document.querySelector('#tabla-amortizacion tbody');
  tbody.innerHTML = '';

  let totalIntereses = 0;
  let totalIVAIntereses = 0;
  let totalPagado = 0;
  let totalPrepagos = 0;

  while (prepagosGuardados.length < plazoMeses) {
    prepagosGuardados.push(0);
  }

  for (let mes = 1; mes <= plazoMeses; mes++) {
    const pagoInteresesOrdinarios = saldoCapital * tasaMensual;
    const pagoIVAInteres = pagoInteresesOrdinarios * 0.16;
    let pagoMensualTotal = pagoFijoMensual + pagoInteresesOrdinarios + pagoIVAInteres;
    
    let prepago = prepagosGuardados[mes - 1] || 0;
    
    totalPrepagos += prepago;
    pagoMensualTotal += prepago;
    
    totalIntereses += pagoInteresesOrdinarios;
    totalIVAIntereses += pagoIVAInteres;
    totalPagado += pagoMensualTotal;

    const saldoCapitalRedondeado = Math.round(saldoCapital * 100) / 100;
    const interesesRedondeados = Math.round(pagoInteresesOrdinarios * 100) / 100;
    const ivaRedondeado = Math.round(pagoIVAInteres * 100) / 100;
    const pagoTotalRedondeado = Math.round(pagoMensualTotal * 100) / 100;

    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${mes}</td>
      <td>$${saldoCapitalRedondeado.toFixed(2)}</td>
      <td>$${interesesRedondeados.toFixed(2)}</td>
      <td>$${pagoFijoMensual.toFixed(2)}</td>
      <td>$${ivaRedondeado.toFixed(2)}</td>
      <td>$${pagoTotalRedondeado.toFixed(2)}</td>
      <td><input type="number" id="prepago_${mes}" value="${prepago}" step="100" style="width: 100px; padding: 5px;" placeholder="0"></td>
    `;

    saldoCapital -= pagoFijoMensual;
    saldoCapital -= prepago;
    if (saldoCapital < 0) saldoCapital = 0;
  }

  const oldTfoot = document.querySelector('#tabla-amortizacion tfoot');
  if (oldTfoot) oldTfoot.remove();
  
  const tfoot = document.createElement('tfoot');
  const catValue = document.getElementById('cat').value || datosOriginales.cat || '0';
  
  tfoot.innerHTML = `
    <tr style="background-color: #003b6f; color: white; font-weight: bold;">
      <td colspan="2">TOTALES</td>
      <td>$${totalIntereses.toFixed(2)}</td>
      <td>$${(pagoFijoMensual * plazoMeses).toFixed(2)}</td>
      <td>$${totalIVAIntereses.toFixed(2)}</td>
      <td>$${totalPagado.toFixed(2)}</td>
      <td>$${totalPrepagos.toFixed(2)}</td>
    </tr>
    <tr style="background-color: #e8f0fe; font-weight: bold;">
      <td colspan="7" style="text-align: left; padding: 12px;">
        <strong>RESUMEN FINAL DEL CREDITO</strong><br><br>
        Cliente: ${datosOriginales.nombre}<br>
        Monto autorizado: $${datosOriginales.montoAutorizado.toFixed(2)}<br>
        Comision con IVA: $${datosOriginales.comisionConIVA.toFixed(2)}<br>
        Total financiado: $${datosOriginales.totalFinanciar.toFixed(2)}<br>
        Tasa anual: ${datosOriginales.tasaAnual}%<br>
        CAT: ${catValue}%<br>
        Plazo: ${datosOriginales.plazoMeses} meses<br><br>
        <span style="color: #003b6f;">Total de intereses pagados: $${totalIntereses.toFixed(2)}</span><br>
        <span style="color: #003b6f;">Total de IVA sobre intereses: $${totalIVAIntereses.toFixed(2)}</span><br>
        <span style="color: #003b6f;">TOTAL GENERAL QUE PAGARA: $${totalPagado.toFixed(2)}</span><br>
        <span style="color: #003b6f;">Total de PREPAGOS realizados: $${totalPrepagos.toFixed(2)}</span><br><br>
        <span style="color: #28a745;">Ahorro por prepagos: $${((datosOriginales.totalFinanciar + totalIntereses + totalIVAIntereses) - totalPagado).toFixed(2)}</span>
      </td>
    </tr>
  `;
  
  document.querySelector('#tabla-amortizacion').appendChild(tfoot);
  
  for (let mes = 1; mes <= plazoMeses; mes++) {
    const input = document.getElementById(`prepago_${mes}`);
    if (input) {
      input.addEventListener('change', (e) => {
        prepagosGuardados[mes - 1] = parseFloat(e.target.value) || 0;
        recalcularConPrepagos();
      });
    }
  }
}

function recalcularConPrepagos() {
  if (!datosOriginales) return;
  window.datosCredito = { ...datosOriginales };
  generarTablaConPrepagos();
}

function limpiarFormulario() {
  document.getElementById('nombre').value = '';
  document.getElementById('montoAutorizado').value = '';
  document.getElementById('comisionPorcentaje').value = '';
  document.getElementById('plazo').value = '';
  document.getElementById('tasa').value = '';
  document.getElementById('cat').value = '';

  document.getElementById('comisionMonto').innerHTML = '$0.00';
  document.getElementById('totalFinanciar').innerHTML = '$0.00';
  document.getElementById('pagoPorMil').innerHTML = '$0.00';

  document.getElementById('tabla-container').style.display = 'none';
  document.querySelector('#tabla-amortizacion tbody').innerHTML = '';
  
  const oldTfoot = document.querySelector('#tabla-amortizacion tfoot');
  if (oldTfoot) oldTfoot.remove();

  prepagosGuardados = [];
  
  window.datosCredito = null;
  datosOriginales = null;
}