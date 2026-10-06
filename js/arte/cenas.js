/*
 * Cenas montadas a partir das peças: o hero, a pilha explodida, as caixas de entrega e as
 * imagens dos cartões do cardápio. Expõe Arte.desenhar(nome, config) e Arte.item(ilustracao).
 */
(function () {
  'use strict';

  const A = window.Arte;
  const { n, serrilha, escapar } = A;

  // Distância extra entre camadas quando a pilha está totalmente aberta (em unidades do SVG).
  const VAO_PILHA = 56;
  const CAMADAS_PADRAO = Object.freeze(['pao-topo', 'molho', 'cebola', 'queijo', 'carne', 'pao-base']);

  function svg(viewBox, conteudo, rotulo, classe = '') {
    const acessivel = rotulo ? `role="img" aria-label="${escapar(rotulo)}"` : 'aria-hidden="true"';
    return `<svg class="arte ${classe}" viewBox="${viewBox}" ${acessivel} preserveAspectRatio="xMidYMid meet">${conteudo}</svg>`;
  }

  // Hambúrguer centralizado em cx, com a base em yBase, encolhido para caber em alturaMax.
  function hamburguerEm(nomes, cx, yBase, alturaMax, classe = '') {
    const altura = A.alturaHamburguer(nomes);
    const escala = Math.min(1, alturaMax / altura);
    const x = n(cx - 200 * escala);
    const y = n(yBase - altura * escala);
    return `<g transform="translate(${x} ${y}) scale(${n(escala * 100) / 100})"><g class="${classe}">${A.hamburguer(nomes)}</g></g>`;
  }

  function sombra(cx, cy, rx, ry, opacidade, classe = '') {
    return `<ellipse class="${classe}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000000" opacity="${opacidade}" filter="url(#f-desfoque)"/>`;
  }

  // Papel manteiga em perspectiva, com as bordas laterais serrilhadas.
  function papel(a, b, c, d) {
    return `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]} ${serrilha(b[0], b[1], c[0], c[1], 14, -5)} L${d[0]} ${d[1]} ${serrilha(d[0], d[1], a[0], a[1], 14, -5)} Z" fill="url(#g-papel)"/>`;
  }

  function hero() {
    const conteudo = `
      ${papel([120, 352], [792, 330], [874, 454], [34, 488])}
      ${sombra(450, 420, 220, 24, 0.55, 'sombra-flutua')}
      ${hamburguerEm(CAMADAS_PADRAO, 450, 418, 300, 'flutua')}`;
    return svg('0 0 900 540', conteudo, 'Smash burger on parchment paper', 'arte-hero');
  }

  function pilha(config) {
    const itens = config.pilha;
    const nomes = itens.map((item) => item.camada);
    const margem = ((nomes.length - 1) / 2) * VAO_PILHA + 30;
    const rotulo = (i, y) => {
      const [forte, fraco] = itens[i].rotulo.map((linha) => escapar(String(linha).toUpperCase()));
      return `<g class="rotulo" style="--atraso:${i}">
        <circle cx="386" cy="${y}" r="3.5"/><line x1="386" y1="${y}" x2="446" y2="${y}"/>
        <text x="458" y="${y - 3}" class="rotulo-forte">${forte}</text>
        <text x="458" y="${y + 20}" class="rotulo-fraco">${fraco}</text></g>`;
    };
    const altura = A.alturaHamburguer(nomes);
    const viewBox = `-10 ${-margem} 740 ${altura + margem * 2}`;
    return svg(viewBox, A.hamburguer(nomes, rotulo), 'Burger layers, from bun to bun', 'arte-pilha');
  }

  // Nome da marca impresso na caixa: a linha 1 é forçada a caber na largura com textLength.
  function marcaNaCaixa(config, cx, y, largura, tamanho) {
    const { caixaLinha1, caixaLinha2 } = config.marca;
    const meia = largura / 2;
    return `
      <text x="${cx}" y="${y}" class="arte-titulo" font-size="${tamanho}" fill="#F4F1EC" text-anchor="middle" textLength="${largura}" lengthAdjust="spacingAndGlyphs">${escapar(caixaLinha1)}</text>
      <path d="M${cx - meia} ${n(y + tamanho * 0.42)} H${n(cx - tamanho * 0.9)} M${n(cx + tamanho * 0.9)} ${n(y + tamanho * 0.42)} H${cx + meia}" stroke="#D62828" stroke-width="${n(tamanho * 0.05)}"/>
      <text x="${cx}" y="${n(y + tamanho * 0.56)}" class="arte-titulo" font-size="${n(tamanho * 0.36)}" fill="#D62828" text-anchor="middle" letter-spacing="2">${escapar(caixaLinha2)}</text>`;
  }

  function slogan(config, cx, y, largura) {
    const meia = largura / 2;
    return `
      <path d="M${cx - meia} ${y - 5} H${cx - 120} M${cx + 120} ${y - 5} H${cx + meia - 30}" stroke="#D62828" stroke-width="4"/>
      ${A.estrela(cx + meia - 14, y - 5, 9, '#D62828')}
      <text x="${cx}" y="${y}" class="arte-titulo" font-size="16" fill="#D62828" text-anchor="middle" letter-spacing="3">${escapar(config.marca.slogan)}</text>`;
  }

  function caixaAberta(config) {
    const conteudo = `
      ${sombra(450, 585, 400, 18, 0.6)}
      <path d="M150 -60 L750 -60 L776 232 L124 232 Z" fill="url(#g-caixa)"/>
      ${A.logo(236, 26, 56)}
      ${marcaNaCaixa(config, 520, 36, 400, 74)}
      ${slogan(config, 450, 110, 520)}
      <path d="M124 232 L776 232 L832 442 L68 442 Z" fill="#0C0C0C"/>
      <path d="M392 236 L380 440 M580 236 L600 440" stroke="#1F1F1F" stroke-width="6"/>
      ${hamburguerEm(CAMADAS_PADRAO, 252, 420, 200)}
      <g transform="translate(372 116) scale(.86)">${A.fritas()}</g>
      <g transform="translate(600 92) scale(.9)">${A.milkshake('chocolate')}</g>
      <ellipse cx="436" cy="432" rx="44" ry="14" fill="#F4F1EC"/><ellipse cx="436" cy="430" rx="34" ry="9" fill="#F0A64B"/>
      <ellipse cx="540" cy="436" rx="44" ry="14" fill="#F4F1EC"/><ellipse cx="540" cy="434" rx="34" ry="9" fill="#5A1E14"/>
      <path d="M68 442 L832 442 L810 580 L90 580 Z" fill="url(#g-caixa)"/>
      <path d="M832 442 L776 232 L794 238 L852 450 L830 580 L810 580 Z" fill="#C81E2B"/>
      ${A.logo(196, 512, 46)}
      ${marcaNaCaixa(config, 500, 518, 440, 62)}`;
    return svg('0 -80 900 680', conteudo, 'Game day combo box with burger, fries and shake', 'arte-caixa');
  }

  function caixaFechada(config) {
    const conteudo = `
      ${sombra(450, 412, 390, 20, 0.7)}
      <path d="M150 70 L750 70 L800 122 L100 122 Z" fill="#262626"/>
      <ellipse cx="450" cy="94" rx="76" ry="14" fill="#D62828"/>
      <path d="M408 106 H492 V122 H408 Z" fill="#141414"/>
      <rect x="100" y="122" width="700" height="276" fill="url(#g-caixa)"/>
      ${A.logo(236, 252, 80)}
      ${marcaNaCaixa(config, 556, 262, 420, 96)}
      ${slogan(config, 556, 356, 420)}`;
    return svg('0 0 900 440', conteudo, 'Closed delivery box', 'arte-caixa');
  }

  // Cartões do cardápio: todos em 480 x 360, para a grade ficar alinhada.
  function cartaoHamburguer(nomes) {
    return `
      ${papel([64, 286], [420, 272], [458, 330], [24, 344])}
      ${sombra(240, 306, 150, 14, 0.5)}
      ${hamburguerEm(nomes, 240, 306, 250)}`;
  }

  function cartaoCombo() {
    return `
      <rect x="30" y="268" width="420" height="30" rx="6" fill="#7A4B2A"/><rect x="30" y="268" width="420" height="8" rx="4" fill="#A0693F"/>
      <g transform="translate(316 92) scale(.6)">${A.refrigerante()}</g>
      <g transform="translate(26 74) scale(.66)">${A.fritas()}</g>
      ${hamburguerEm(CAMADAS_PADRAO, 250, 270, 150)}`;
  }

  const CARTOES = Object.freeze({
    hamburguer: (il) => cartaoHamburguer(il.camadas && il.camadas.length ? il.camadas : CAMADAS_PADRAO),
    combo: () => cartaoCombo(),
    fritas: () => `${sombra(240, 330, 110, 12, 0.5)}<g transform="translate(90 34) scale(1)">${A.fritas()}</g>`,
    'batata-recheada': () => `${sombra(240, 300, 150, 14, 0.5)}<g transform="translate(64 70) scale(1.1)">${A.batataRecheada()}</g>`,
    milkshake: (il) => `${sombra(240, 342, 80, 10, 0.5)}<g transform="translate(150 6) scale(.96)">${A.milkshake(il.sabor)}</g>`
  });

  function item(ilustracao, rotulo) {
    const desenhar = CARTOES[ilustracao.tipo];
    if (!desenhar) throw new Error(`Ilustração de cardápio desconhecida: "${ilustracao.tipo}"`);
    return svg('0 0 480 360', desenhar(ilustracao), rotulo, 'arte-cartao');
  }

  const CENAS = Object.freeze({
    logo: () => svg('0 0 64 64', A.logo(32, 32, 30), ''),
    hero: () => hero(),
    pilha: (config) => pilha(config),
    'caixa-aberta': (config) => caixaAberta(config),
    'caixa-fechada': (config) => caixaFechada(config)
  });

  function desenhar(nome, config) {
    const cena = CENAS[nome];
    if (!cena) throw new Error(`Cena desconhecida: "${nome}"`);
    return cena(config);
  }

  window.Arte = Object.freeze({ ...window.Arte, VAO_PILHA, desenhar, item });
})();
