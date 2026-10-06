/*
 * Acompanhamentos e marca: logo, estrela, fritas, batata recheada, milkshake e refrigerante.
 * Cada função devolve o conteúdo em coordenadas próprias (indicadas no comentário), para
 * ser posicionado com <g transform> nas cenas.
 */
(function () {
  'use strict';

  const { n, aleatorio, pontilhado } = window.Arte;

  function estrela(cx, cy, raio, cor) {
    const pontos = Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 === 0 ? raio : raio * 0.45;
      const angulo = (Math.PI / 5) * i - Math.PI / 2;
      return `${n(cx + r * Math.cos(angulo))},${n(cy + r * Math.sin(angulo))}`;
    }).join(' ');
    return `<polygon points="${pontos}" fill="${cor}"/>`;
  }

  // Selo redondo da marca: uma bola de basquete estilizada com estrela.
  function logo(cx, cy, r) {
    const traco = n(r * 0.07);
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#D62828"/>
      <circle cx="${cx}" cy="${cy}" r="${n(r * 0.84)}" fill="none" stroke="#FFFFFF" stroke-width="${traco}"/>
      <g fill="none" stroke="#FFFFFF" stroke-width="${traco}" opacity=".9">
        <path d="M${cx} ${n(cy - r * 0.84)} V${n(cy + r * 0.84)}"/>
        <path d="M${n(cx - r * 0.84)} ${cy} H${n(cx + r * 0.84)}"/>
        <path d="M${n(cx - r * 0.6)} ${n(cy - r * 0.6)} C${n(cx - r * 0.25)} ${n(cy - r * 0.2)} ${n(cx - r * 0.25)} ${n(cy + r * 0.2)} ${n(cx - r * 0.6)} ${n(cy + r * 0.6)}"/>
        <path d="M${n(cx + r * 0.6)} ${n(cy - r * 0.6)} C${n(cx + r * 0.25)} ${n(cy - r * 0.2)} ${n(cx + r * 0.25)} ${n(cy + r * 0.2)} ${n(cx + r * 0.6)} ${n(cy + r * 0.6)}"/>
      </g>
      <circle cx="${cx}" cy="${cy}" r="${n(r * 0.3)}" fill="#D62828"/>
      ${estrela(cx, cy, r * 0.26, '#FFFFFF')}`;
  }

  // Palitos em pé, de x0 a x1, apoiados em yBase.
  function palitos(semente, quantidade, x0, x1, yBase, alturas) {
    const sorteio = aleatorio(semente);
    return Array.from({ length: quantidade }, (_, i) => {
      const x = x0 + ((x1 - x0) * (i + sorteio() * 0.6)) / quantidade;
      const h = alturas[0] + sorteio() * (alturas[1] - alturas[0]);
      const giro = n((sorteio() - 0.5) * 20);
      return `<rect x="${n(x)}" y="${n(yBase - h)}" width="15" height="${n(h)}" rx="3" fill="url(#g-frita)" stroke="#C47A16" stroke-width="1.2" transform="rotate(${giro} ${n(x + 7)} ${yBase})"/>`;
    }).join('');
  }

  // Coordenadas 0..300 x 0..300.
  function fritas() {
    return `
      ${palitos(41, 13, 76, 214, 190, [96, 150])}
      <path d="M66 150 L234 150 L214 290 L86 290 Z" fill="#D62828"/>
      <path d="M62 146 L238 146 L234 164 L66 164 Z" fill="#A71C1C"/>
      <path d="M77 206 L223 206 L219 234 L81 234 Z" fill="#FFFFFF"/>
      ${estrela(150, 220, 11, '#D62828')}
      <path d="M86 290 L214 290" stroke="#7E1414" stroke-width="4" stroke-linecap="round"/>`;
  }

  // Coordenadas 0..320 x 0..240.
  function batataRecheada() {
    const sorteio = aleatorio(53);
    const deitadas = Array.from({ length: 16 }, (_, i) => {
      const x = 40 + (i % 8) * 30 + sorteio() * 10;
      const y = 84 + Math.floor(i / 8) * 18 + sorteio() * 10;
      const giro = n((sorteio() - 0.5) * 70);
      return `<rect x="${n(x)}" y="${n(y)}" width="66" height="13" rx="3" fill="url(#g-frita)" stroke="#C47A16" stroke-width="1" transform="rotate(${giro} ${n(x + 33)} ${n(y + 6)})"/>`;
    }).join('');
    const bacon = pontilhado(61, 16, { x: 56, y: 84, l: 210, a: 30 }, (x, y, s) =>
      `<rect x="${n(x)}" y="${n(y)}" width="${n(7 + s() * 5)}" height="6" rx="2" fill="#8E2B1E"/>`);
    const cebolinha = pontilhado(67, 20, { x: 50, y: 80, l: 220, a: 36 }, (x, y) =>
      `<circle cx="${n(x)}" cy="${n(y)}" r="3" fill="#6DBE45"/>`);
    const pimenta = [[96, 92], [176, 86], [238, 98]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="8" fill="#9CCF5A" stroke="#3E8E2E" stroke-width="3"/>`).join('');
    return `
      ${deitadas}
      <path d="M24 120 L296 120 L268 222 L52 222 Z" fill="url(#p-xadrez)" stroke="#A81C1C" stroke-width="3" stroke-linejoin="round"/>
      <path d="M44 104 C80 82 100 122 132 98 C162 76 182 118 212 96 C242 74 262 112 286 96" stroke="#EFA11A" stroke-width="15" fill="none" stroke-linecap="round"/>
      <path d="M44 104 C80 82 100 122 132 98 C162 76 182 118 212 96 C242 74 262 112 286 96" stroke="#FFD45E" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${bacon}${cebolinha}${pimenta}`;
  }

  const SABORES = Object.freeze({
    chocolate: { cor: '#7A4A33', calda: '#3E1F12' },
    morango: { cor: '#F2A1B5', calda: '#C23B5A' },
    baunilha: { cor: '#F5E6C4', calda: '#C99A4B' }
  });

  // Coordenadas 0..240 x 0..360.
  function milkshake(sabor = 'chocolate') {
    const { cor, calda } = SABORES[sabor] || SABORES.chocolate;
    const listras = Array.from({ length: 9 }, (_, i) =>
      `<rect x="152" y="${i * 17}" width="12" height="8" fill="#D62828"/>`).join('');
    const chantilly = [[90, 120, 26], [150, 120, 26], [120, 106, 30], [104, 88, 20], [136, 86, 20], [120, 72, 16]]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFDF7" stroke="#E8E0D2" stroke-width="1.5"/>`).join('');
    return `
      <g transform="rotate(14 160 80)"><rect x="152" y="0" width="12" height="150" fill="#FFFFFF"/>${listras}</g>
      <path d="M58 132 L182 132 L166 342 L74 342 Z" fill="url(#g-copo)" opacity=".95"/>
      <path d="M65 142 L175 142 L161 334 L79 334 Z" fill="${cor}"/>
      <path d="M68 150 C80 176 72 196 82 222 M172 150 C160 184 168 204 158 236 M100 146 C104 168 98 180 104 196 M140 146 C136 172 144 186 138 206" stroke="${calda}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M76 150 L86 150 L92 324 L84 324 Z" fill="#FFFFFF" opacity=".35"/>
      <rect x="52" y="124" width="136" height="12" rx="6" fill="#FFFFFF" stroke="#DCD5CA"/>
      ${chantilly}
      <path d="M124 40 C126 26 134 18 146 12" stroke="#5B3A1A" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="124" cy="52" r="14" fill="#D3182B"/><circle cx="119" cy="47" r="4" fill="#FFFFFF" opacity=".6"/>
      ${logo(120, 258, 30)}`;
  }

  // Coordenadas 0..200 x 0..300.
  function refrigerante() {
    const gelo = [[64, 84], [98, 76], [126, 92], [80, 112]].map(([x, y]) =>
      `<rect x="${x}" y="${y}" width="28" height="26" rx="6" fill="#D9F1FF" opacity=".45"/>`).join('');
    return `
      <rect x="112" y="0" width="10" height="120" fill="#151515" transform="rotate(10 117 60)"/>
      <path d="M40 60 L160 60 L148 292 L52 292 Z" fill="url(#g-refri)"/>
      ${gelo}
      <path d="M52 70 L62 70 L70 280 L62 280 Z" fill="#FFFFFF" opacity=".22"/>
      <rect x="34" y="54" width="132" height="10" rx="5" fill="#E9E4DC"/>`;
  }

  window.Arte = Object.freeze({ ...window.Arte, estrela, logo, fritas, batataRecheada, milkshake, refrigerante });
})();
