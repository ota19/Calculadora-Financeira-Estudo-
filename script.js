// -- Calculadora INSS + IR --
const form = document.getElementById('form-calculo');
const resultado = document.getElementById('resultado');

const faixasINSS = [
  { limite: 1302.00, aliquota: 0.075 },
  { limite: 2571.29, aliquota: 0.09 },
  { limite: 3856.94, aliquota: 0.12 },
  { limite: 7507.49, aliquota: 0.14 },
];
const tetoINSS = 877.24;

const ctxInssIr = document.getElementById('chartInssIr')?.getContext('2d');
let chartInssIr;

function atualizarGraficoInssIr(bruto, inss, ir) {
  if (!ctxInssIr) return;

  const liquido = bruto - inss - ir;
  const labels = ['INSS', 'IRRF', 'Líquido'];
  const valores = [inss, ir, liquido];

  if (chartInssIr) {
    chartInssIr.data.datasets[0].data = valores;
    chartInssIr.update();
  } else {
    chartInssIr = new Chart(ctxInssIr, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: valores,
          backgroundColor: ['#f39c12', '#c0392b', '#27ae60'],
        }]
      },
      options: {
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }
}

form.addEventListener('submit', e => {
  e.preventDefault();

  const salario = parseFloat(document.getElementById('salario').value);
  if (isNaN(salario) || salario < 0) {
    resultado.classList.add('error');
    resultado.innerHTML = "<i class='fa-solid fa-triangle-exclamation'></i> Por favor, informe um salário válido.";
    return;
  }
  resultado.classList.remove('error');

  let inss = 0;
  if (salario > faixasINSS[3].limite) {
    inss = tetoINSS;
  } else {
    inss += Math.min(salario, faixasINSS[0].limite) * faixasINSS[0].aliquota;
    if (salario > faixasINSS[0].limite) {
      inss += (Math.min(salario, faixasINSS[1].limite) - faixasINSS[0].limite) * faixasINSS[1].aliquota;
    }
    if (salario > faixasINSS[1].limite) {
      inss += (Math.min(salario, faixasINSS[2].limite) - faixasINSS[1].limite) * faixasINSS[2].aliquota;
    }
    if (salario > faixasINSS[2].limite) {
      inss += (salario - faixasINSS[2].limite) * faixasINSS[3].aliquota;
    }
  }

  const baseIR = salario - inss;

  const tabelaIR = [
    { limite: 1903.98, aliquota: 0, deducao: 0 },
    { limite: 2826.65, aliquota: 7.5, deducao: 142.80 },
    { limite: 3751.05, aliquota: 15, deducao: 354.80 },
    { limite: 4664.68, aliquota: 22.5, deducao: 636.13 },
    { limite: Infinity, aliquota: 27.5, deducao: 869.36 }
  ];

  let ir = 0;
  for (const faixa of tabelaIR) {
    if (baseIR <= faixa.limite) {
      ir = (baseIR * faixa.aliquota / 100) - faixa.deducao;
      if (ir < 0) ir = 0;
      break;
    }
  }

  const salarioLiquido = salario - inss - ir;

  resultado.innerHTML =
    `<i class="fa-solid fa-circle-check"></i> INSS: R$ ${inss.toFixed(2)} <br>` +
    `IRRF: R$ ${ir.toFixed(2)} <br>` +
    `<strong>Salário líquido: R$ ${salarioLiquido.toFixed(2)}</strong>`;

  atualizarGraficoInssIr(salario, inss, ir);
});


// -- Tarifas de Exportação --
const formExport = document.getElementById('form-exportacao');
const resultadoExport = document.getElementById('resultado-exportacao');

const ctxExport = document.getElementById('chartExportacao')?.getContext('2d');
let chartExport;

function atualizarGraficoExportacao(valor, tarifaValor) {
  if (!ctxExport) return;

  const restante = valor - tarifaValor;
  const labels = ['Tarifa', 'Valor Líquido'];
  const valores = [tarifaValor, restante];

  if (chartExport) {
    chartExport.data.datasets[0].data = valores;
    chartExport.update();
  } else {
    chartExport = new Chart(ctxExport, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: valores,
          backgroundColor: ['#e74c3c', '#2ecc71']
        }]
      },
      options: {
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }
}

formExport.addEventListener('submit', e => {
  e.preventDefault();

  const valor = parseFloat(document.getElementById('valor-produto').value);
  const tarifa = parseFloat(document.getElementById('percent-tarifa').value);

  if (isNaN(valor) || valor < 0 || isNaN(tarifa) || tarifa < 0) {
    resultadoExport.classList.add('error');
    resultadoExport.innerHTML = "<i class='fa-solid fa-triangle-exclamation'></i> Informe valores válidos.";
    return;
  }
  resultadoExport.classList.remove('error');

  const valorTarifa = valor * (tarifa / 100);

  resultadoExport.innerHTML = `<i class="fa-solid fa-circle-check"></i> Tarifa: R$ ${valorTarifa.toFixed(2)}`;

  atualizarGraficoExportacao(valor, valorTarifa);
});


// -- Calculadora de Frete --
const formFrete = document.getElementById('form-frete');
const resultadoFrete = document.getElementById('resultado-frete');

const ctxFrete = document.getElementById('chartFrete')?.getContext('2d');
let chartFrete;

function atualizarGraficoFrete(custo) {
  if (!ctxFrete) return;

  const labels = ['Custo do Frete'];
  const valores = [custo];

  if (chartFrete) {
    chartFrete.data.datasets[0].data = valores;
    chartFrete.update();
  } else {
    chartFrete = new Chart(ctxFrete, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Custo (R$)',
          data: valores,
          backgroundColor: ['#8e44ad']
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
}

formFrete.addEventListener('submit', e => {
  e.preventDefault();

  const peso = parseFloat(document.getElementById('peso').value);
  const distancia = parseFloat(document.getElementById('distancia').value);
  const modalidade = document.getElementById('modalidade').value;

  if (isNaN(peso) || peso <= 0 || isNaN(distancia) || distancia <= 0 || !modalidade) {
    resultadoFrete.classList.add('error');
    resultadoFrete.innerHTML = "<i class='fa-solid fa-triangle-exclamation'></i> Preencha todos os campos corretamente.";
    return;
  }
  resultadoFrete.classList.remove('error');

  let precoPorKmPorKg;
  switch(modalidade) {
    case 'rodoviario': precoPorKmPorKg = 0.02; break;
    case 'aereo': precoPorKmPorKg = 0.05; break;
    case 'maritimo': precoPorKmPorKg = 0.01; break;
    default: precoPorKmPorKg = 0.02;
  }

  const custo = peso * distancia * precoPorKmPorKg;

  resultadoFrete.innerHTML = `<i class="fa-solid fa-circle-check"></i> Custo estimado do frete: R$ ${custo.toFixed(2)}`;

  atualizarGraficoFrete(custo);
});


// -- Conversor de moedas (já existente e funcionando) --
const formConversor = document.getElementById('form-conversor');
const resultadoConversor = document.getElementById('resultado-conversor');
const ctxConversor = document.getElementById('chartConversor')?.getContext('2d');
let chartConversor;

const taxasCambio = {
  USD: 5.10,
  EUR: 5.60,
  GBP: 6.30,
  JPY: 0.037,
  CAD: 4.00
};

function atualizarGraficoConversor(brl, moeda, valorConvertido) {
  if (!ctxConversor) return;
  const labels = ['BRL', moeda];
  const valores = [brl, valorConvertido];

  if (chartConversor) {
    chartConversor.data.labels = labels;
    chartConversor.data.datasets[0].data = valores;
    chartConversor.update();
  } else {
    chartConversor = new Chart(ctxConversor, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Valores Convertidos',
          data: valores,
          backgroundColor: ['#16a085', '#2980b9']
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
}

formConversor.addEventListener('submit', e => {
  e.preventDefault();

  const valorBRL = parseFloat(document.getElementById('valor-brl').value);
  const moeda = document.getElementById('moeda-destino').value;

  if (isNaN(valorBRL) || valorBRL < 0 || !moeda || !(moeda in taxasCambio)) {
    resultadoConversor.classList.add('error');
    resultadoConversor.innerHTML = "<i class='fa-solid fa-triangle-exclamation'></i> Valores inválidos ou moeda não selecionada.";
    return;
  }
  resultadoConversor.classList.remove('error');

  const valorConvertido = valorBRL / taxasCambio[moeda];

  resultadoConversor.innerHTML = `<i class="fa-solid fa-circle-check"></i> R$ ${valorBRL.toFixed(2)} equivalem a ${valorConvertido.toFixed(2)} ${moeda}`;

  atualizarGraficoConversor(valorBRL, moeda, valorConvertido);
});
