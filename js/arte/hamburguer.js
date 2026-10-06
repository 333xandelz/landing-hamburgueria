/*
 * Camadas do hambúrguer. Cada camada é desenhada a partir de y = 0, com 400 de largura
 * (centro em x = 200). "avanco" é quanto a pilha desce até a próxima camada; "altura" é
 * até onde o desenho vai (o queijo escorre além do próprio avanço); "meio" é a altura do
 * rótulo na seção The Stack.
 */
(function () {
  'use strict';

  const { n, aleatorio, bordaOndulada, pontilhado } = window.Arte;

  function paoTopo() {
    const sementes = pontilhado(7, 22, { x: 78, y: 26, l: 244, a: 70 }, (x, y, sorteio) => {
      const giro = n((sorteio() - 0.5) * 70);
      return `<ellipse cx="${n(x)}" cy="${n(y)}" rx="6.5" ry="3.2" fill="#FFF2D4" stroke="#D9A86A" stroke-width=".8" transform="rotate(${giro} ${n(x)} ${n(y)})"/>`;
    });
    return `
      <path d="M28 108 C28 40 104 4 200 4 C296 4 372 40 372 108 C372 119 364 124 352 124 L48 124 C36 124 28 119 28 108 Z" fill="url(#g-pao)"/>
      <path d="M44 114 C120 124 280 124 356 114" stroke="#7E3A10" stroke-opacity=".35" stroke-width="7" fill="none" stroke-linecap="round"/>
      <ellipse cx="150" cy="36" rx="74" ry="15" fill="#FFFFFF" opacity=".24" transform="rotate(-11 150 36)"/>
      ${sementes}`;
  }

  function molho() {
    return `
      <path d="M32 4 C90 0 130 9 170 5 C220 0 270 10 320 5 C342 3 358 6 368 4 L368 14 C352 18 344 16 336 22 C328 30 318 20 304 17 C262 14 244 23 222 19 C204 15 190 28 174 21 C150 14 122 19 102 17 C82 15 72 24 60 19 C46 14 38 17 32 14 Z" fill="#E66A31"/>
      <path d="M52 7 C130 3 270 3 350 7" stroke="#FFB48C" stroke-width="2.5" fill="none" opacity=".7" stroke-linecap="round"/>`;
  }

  function alface() {
    const sorteio = aleatorio(11);
    const topo = bordaOndulada(16, 384, 12, 9, 16, sorteio);
    const base = bordaOndulada(386, 14, 22, 7, 16, sorteio);
    return `
      <path d="M16 12 ${topo} L386 22 ${base} Z" fill="#58A537"/>
      <path d="M16 12 ${bordaOndulada(16, 384, 12, 9, 16, aleatorio(11))}" stroke="#8FD465" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }

  function tomate() {
    const fatia = (x) => `
      <rect x="${x}" y="2" width="168" height="16" rx="8" fill="#D2352A"/>
      <rect x="${x + 10}" y="5" width="148" height="7" rx="3.5" fill="#EF6D57"/>`;
    return fatia(30) + fatia(202);
  }

  function cebola() {
    const sorteio = aleatorio(23);
    const fios = Array.from({ length: 9 }, (_, i) => {
      const x = 34 + i * 38;
      const cor = i % 2 === 0 ? '#C8773A' : '#7A3512';
      const altura = n(6 + sorteio() * 12);
      return `<path d="M${x} ${altura} C${x + 14} ${altura - 8} ${x + 26} ${altura + 10} ${x + 44} ${altura}" stroke="${cor}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    }).join('');
    return `
      <path d="M30 6 C90 0 140 10 200 4 C260 -2 320 8 370 4 L372 16 C330 24 290 14 250 20 C210 26 170 16 130 22 C90 26 60 18 28 18 Z" fill="#9A4B1D"/>
      ${fios}`;
  }

  function bacon() {
    const sorteio = aleatorio(31);
    const topo = bordaOndulada(26, 374, 6, 5, 7, sorteio);
    const base = bordaOndulada(374, 26, 20, 5, 7, sorteio);
    return `
      <path d="M26 6 ${topo} L374 20 ${base} Z" fill="#A63626"/>
      <path d="M30 13 ${bordaOndulada(30, 370, 13, 4, 7, aleatorio(5))}" stroke="#F2B49E" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }

  function picles() {
    return [96, 160, 224, 288].map((x) => `
      <ellipse cx="${x}" cy="7" rx="30" ry="6" fill="#7DA43A"/>
      <ellipse cx="${x}" cy="6" rx="21" ry="3" fill="#B7D46E"/>`).join('');
  }

  function queijo() {
    return `
      <path d="M22 2 L378 2 L386 12 C374 14 366 14 360 18 C356 30 350 40 344 40 C338 40 336 28 332 18 C300 16 282 16 264 18 C260 34 254 46 246 46 C238 46 236 30 232 18 C194 16 164 16 134 18 C130 28 124 36 118 36 C112 36 110 26 106 18 C82 16 54 16 42 16 C34 24 28 30 22 28 C14 26 14 14 22 2 Z" fill="url(#g-queijo)"/>
      <path d="M30 5 L370 5" stroke="#FFF0A8" stroke-width="2" opacity=".8" stroke-linecap="round"/>`;
  }

  function carne() {
    const textura = pontilhado(17, 46, { x: 44, y: 8, l: 312, a: 38 }, (x, y, sorteio, i) => {
      const cor = i % 3 === 0 ? '#A8613A' : '#24100A';
      return `<circle cx="${n(x)}" cy="${n(y)}" r="${n(1.5 + sorteio() * 2.6)}" fill="${cor}" opacity=".55"/>`;
    });
    return `
      <path d="M36 10 C40 2 60 0 80 2 C120 -2 160 3 200 0 C240 -2 290 3 330 1 C352 0 366 6 368 16 C372 24 366 30 370 38 C368 48 352 54 330 52 C290 56 240 50 200 54 C160 56 110 51 72 54 C50 55 34 48 32 38 C28 30 34 22 30 16 C30 12 33 11 36 10 Z" fill="url(#g-carne)"/>
      <path d="M62 8 C140 4 260 4 340 8" stroke="#A85E37" stroke-width="3" opacity=".6" fill="none" stroke-linecap="round"/>
      ${textura}`;
  }

  function paoBase() {
    return `
      <path d="M34 2 L366 2 C374 2 376 8 374 16 C368 46 326 64 200 64 C74 64 32 46 26 16 C24 8 26 2 34 2 Z" fill="url(#g-pao-base)"/>
      <rect x="30" y="0" width="340" height="10" rx="5" fill="#F3D39A"/>
      <path d="M48 12 C120 16 280 16 352 12" stroke="#C47833" stroke-width="2" opacity=".6" fill="none"/>`;
  }

  const CAMADAS = Object.freeze({
    'pao-topo': { desenho: paoTopo, avanco: 110, altura: 124, meio: 62 },
    molho: { desenho: molho, avanco: 12, altura: 30, meio: 18 },
    alface: { desenho: alface, avanco: 16, altura: 32, meio: 20 },
    tomate: { desenho: tomate, avanco: 14, altura: 18, meio: 12 },
    cebola: { desenho: cebola, avanco: 14, altura: 26, meio: 18 },
    bacon: { desenho: bacon, avanco: 14, altura: 26, meio: 16 },
    picles: { desenho: picles, avanco: 8, altura: 13, meio: 8 },
    queijo: { desenho: queijo, avanco: 10, altura: 46, meio: 10 },
    carne: { desenho: carne, avanco: 46, altura: 56, meio: 30 },
    'pao-base': { desenho: paoBase, avanco: 64, altura: 64, meio: 36 }
  });

  function camada(nome) {
    const definicao = CAMADAS[nome];
    if (!definicao) throw new Error(`Camada de hambúrguer desconhecida: "${nome}"`);
    return definicao;
  }

  // Posição vertical de cada camada, de cima para baixo.
  function posicoes(nomes) {
    return nomes.reduce((lista, nome, i) => {
      const y = i === 0 ? 0 : lista[i - 1] + camada(nomes[i - 1]).avanco;
      return [...lista, y];
    }, []);
  }

  function altura(nomes) {
    const ys = posicoes(nomes);
    return Math.max(...nomes.map((nome, i) => ys[i] + camada(nome).altura));
  }

  /*
   * Monta o hambúrguer como grupos SVG. É desenhado de baixo para cima, para que cada
   * camada cubra a de baixo (o queijo escorre por cima da carne). "rotulo" recebe o índice
   * da camada e devolve o SVG do rótulo, que viaja junto com ela na animação.
   */
  function hamburguer(nomes, rotulo) {
    const ys = posicoes(nomes);
    return nomes
      .map((nome, i) => {
        const def = camada(nome);
        const extra = rotulo ? rotulo(i, ys[i] + def.meio) : '';
        return `<g class="camada" data-indice="${i}"><g transform="translate(0 ${ys[i]})">${def.desenho()}</g>${extra}</g>`;
      })
      .reverse()
      .join('');
  }

  window.Arte = Object.freeze({ ...window.Arte, hamburguer, alturaHamburguer: altura });
})();
