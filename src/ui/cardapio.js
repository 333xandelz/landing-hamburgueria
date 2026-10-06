// Grade "The Lineup": um cartão por item, com um botão "+" em cada tamanho.
import { escapar } from './util.js';

function cartao(produto, indice, moeda) {
  const precos = produto.precos.map((preco, k) => `
    <li>
      <span>${escapar(preco.rotulo)}</span>
      <strong>${moeda.format(preco.valor)}</strong>
      <button type="button" class="item-mais" data-item="${indice}" data-preco="${k}"
        aria-label="Add ${escapar(produto.nome)}, ${escapar(preco.rotulo)}, to the bag">+</button>
    </li>`).join('');
  return `
    <article class="item" data-revelar style="--atraso:${indice % 3}">
      <div class="item-arte item-arte--${escapar(produto.ilustracao.fundo || 'escuro')}">
        <img data-miniatura="${indice}" alt="${escapar(produto.nome)}" hidden>
        <span class="item-carregando" aria-hidden="true"></span>
      </div>
      <h3 class="item-nome">${escapar(produto.nome)}</h3>
      <p class="item-desc">${escapar(produto.descricao)}</p>
      <ul class="item-precos">${precos}</ul>
    </article>`;
}

// Devolve a função que coloca a imagem renderizada no cartão certo.
export function montarCardapio(raiz, cardapio, moeda, aoAdicionar) {
  raiz.innerHTML = cardapio.map((produto, i) => cartao(produto, i, moeda)).join('');
  raiz.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-item]');
    if (!botao) return;
    aoAdicionar(Number(botao.dataset.item), Number(botao.dataset.preco), botao);
  });
  return (indice, url) => {
    const img = raiz.querySelector(`[data-miniatura="${indice}"]`);
    if (!img) return;
    img.src = url;
    img.hidden = false;
    img.parentElement.querySelector('.item-carregando')?.remove();
  };
}
