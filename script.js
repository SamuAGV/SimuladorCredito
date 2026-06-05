document.getElementById('btn-calcular').addEventListener('click', procesarSimulacion);

function procesarSimulacion() {
  const monto = parseFloat(document.getElementById('monto').value);
  const tasaAnual = parseFloat(document.getElementById('tasa').value) / 100;
  const plazoMeses = parseInt(document.getElementById('plazo').value);
  const IVA_VALOR = 0.16;

  if (isNaN(monto) || isNaN(tasaAnual) || monto <= 0) {
    alert("Ingrese parámetros numéricos válidos");
    return;
  }

  const amortizacionCapital = monto / plazoMeses;
  const tasaMensual = tasaAnual / 12;
  let saldoInsoluto = monto;
  const tbody = document.querySelector('#tabla-amortizacion tbody');
  tbody.innerHTML = '';

  for (let mes = 1; mes <= plazoMeses; mes++) {
    const interes = saldoInsoluto * tasaMensual;
    const ivaInteres = interes * IVA_VALOR;
    const pagoMensual = amortizacionCapital + interes + ivaInteres;
    const amortizacionReal = amortizacionCapital;

    tbody.insertRow().innerHTML = `
      <td>${mes}</td>
      <td>$${pagoMensual.toFixed(2)}</td>
      <td>$${interes.toFixed(2)}</td>
      <td>$${ivaInteres.toFixed(2)}</td>
      <td>$${amortizacionReal.toFixed(2)}</td>
      <td>$${saldoInsoluto.toFixed(2)}</td>
    `;

    saldoInsoluto -= amortizacionCapital;
  }
}