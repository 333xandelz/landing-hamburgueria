/*
 * Base das ilustrações: tudo é SVG desenhado em código, sem foto e sem licença de terceiro.
 * Cada arquivo de js/arte acrescenta funções ao namespace window.Arte sem alterar o anterior.
 */
(function () {
  'use strict';

  // Arredonda para uma casa: deixa o SVG gerado curto e legível.
  const n = (valor) => Math.round(valor * 10) / 10;

  // Gerador pseudoaleatório com semente: o mesmo desenho sai igual em toda carga.
  function aleatorio(semente) {
    let estado = semente >>> 0;
    return () => {
      estado = (Math.imul(estado, 1664525) + 1013904223) >>> 0;
      return estado / 4294967296;
    };
  }

  // Borda ondulada de x0 até x1 na altura y (serve para alface, bacon, cebola).
  function bordaOndulada(x0, x1, y, amplitude, passos, sorteio) {
    const largura = (x1 - x0) / passos;
    return Array.from({ length: passos }, (_, i) => {
      const sentido = i % 2 === 0 ? -1 : 1;
      const xc = x0 + largura * (i + 0.5);
      const yc = y + sentido * amplitude * (0.6 + sorteio() * 0.7);
      return `Q${n(xc)} ${n(yc)} ${n(x0 + largura * (i + 1))} ${n(y)}`;
    }).join(' ');
  }

  // Borda serrilhada entre dois pontos (a borda do papel manteiga).
  function serrilha(xa, ya, xb, yb, dentes, amplitude) {
    const dx = (xb - xa) / dentes;
    const dy = (yb - ya) / dentes;
    const comprimento = Math.hypot(xb - xa, yb - ya) || 1;
    const nx = (-(yb - ya) / comprimento) * amplitude;
    const ny = ((xb - xa) / comprimento) * amplitude;
    return Array.from({ length: dentes }, (_, i) => {
      const meio = `L${n(xa + dx * (i + 0.5) + nx)} ${n(ya + dy * (i + 0.5) + ny)}`;
      return `${meio} L${n(xa + dx * (i + 1))} ${n(ya + dy * (i + 1))}`;
    }).join(' ');
  }

  // Pontinhos espalhados num retângulo (textura da carne, gergelim, bacon picado).
  function pontilhado(semente, quantidade, area, desenhar) {
    const sorteio = aleatorio(semente);
    return Array.from({ length: quantidade }, (_, i) =>
      desenhar(area.x + sorteio() * area.l, area.y + sorteio() * area.a, sorteio, i)
    ).join('');
  }

  function escapar(texto) {
    const mapa = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(texto).replace(/[&<>"']/g, (c) => mapa[c]);
  }

  const parada = (offset, cor) => `<stop offset="${offset}" stop-color="${cor}"/>`;
  const vertical = (id, paradas) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${paradas.map(([o, c]) => parada(o, c)).join('')}</linearGradient>`;

  // Gradientes e filtros usados por todas as ilustrações, inseridos uma vez no <body>.
  function definicoes() {
    return `<svg class="arte-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
      <radialGradient id="g-pao" cx="36%" cy="22%" r="85%">
        ${parada(0, '#F9CF7E')}${parada(0.5, '#E28C35')}${parada(1, '#A2501A')}
      </radialGradient>
      ${vertical('g-pao-base', [[0, '#E9A24E'], [1, '#A5531B']])}
      ${vertical('g-carne', [[0, '#80432A'], [0.45, '#5A2B17'], [1, '#2E1408']])}
      ${vertical('g-queijo', [[0, '#FFD65E'], [1, '#EE9F1A']])}
      ${vertical('g-frita', [[0, '#FFE07A'], [1, '#E8A12A']])}
      ${vertical('g-caixa', [[0, '#1E1E1E'], [1, '#0B0B0B']])}
      ${vertical('g-copo', [[0, '#FFFFFF'], [1, '#E9E4DC']])}
      ${vertical('g-refri', [[0, '#5A2A18'], [1, '#1E0B05']])}
      <linearGradient id="g-papel" x1="0" y1="0" x2="1" y2="1">
        ${parada(0, '#FFFFFF')}${parada(0.6, '#F1EDE6')}${parada(1, '#DCD5CA')}
      </linearGradient>
      <pattern id="p-xadrez" width="24" height="24" patternUnits="userSpaceOnUse">
        <rect width="24" height="24" fill="#FFFFFF"/><rect width="12" height="12" fill="#D62828"/>
        <rect x="12" y="12" width="12" height="12" fill="#D62828"/>
      </pattern>
      <filter id="f-desfoque" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="10"/></filter>
    </defs></svg>`;
  }

  window.Arte = Object.freeze({ n, aleatorio, bordaOndulada, serrilha, pontilhado, escapar, definicoes });
})();
