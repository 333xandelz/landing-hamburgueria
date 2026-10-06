// Sacola de pedido: soma os itens, guarda na visita e fecha o pedido pelo WhatsApp ou link.
import gsap from 'gsap';
import { escapar, ler, gravar } from './util.js';

const CHAVE = 'sacola-v1';

export function criarSacola({ config, moeda, painel, botoes, contador, aviso }) {
  const { cardapio, pedido } = config;
  let linhas = ler(CHAVE, []).filter((l) => cardapio[l.item]?.precos[l.preco]);

  const produto = (l) => cardapio[l.item];
  const preco = (l) => produto(l).precos[l.preco];
  const total = () => linhas.reduce((soma, l) => soma + preco(l).valor * l.qtd, 0);
  const quantidade = () => linhas.reduce((soma, l) => soma + l.qtd, 0);
  const lista = painel.querySelector('[data-sacola-lista]');
  const somaTotal = painel.querySelector('[data-sacola-total]');
  const fechar = painel.querySelector('[data-sacola-fechar]');
  const finalizar = painel.querySelector('[data-sacola-finalizar]');

  function mensagem() {
    const itens = linhas.map((l) => `${l.qtd}x ${produto(l).nome} (${preco(l).rotulo}) ${moeda.format(preco(l).valor * l.qtd)}`);
    return [`Hi ${config.marca.nome}! I'd like to order:`, ...itens, `Total: ${moeda.format(total())}`].join('\n');
  }

  function linkPedido() {
    const numero = String(pedido.whatsapp || '').replace(/\D/g, '');
    return numero ? `https://wa.me/${numero}?text=${encodeURIComponent(mensagem())}` : pedido.url;
  }

  function desenhar() {
    lista.innerHTML = linhas.length
      ? linhas.map((l, i) => `
        <li>
          <div><strong>${escapar(produto(l).nome)}</strong><small>${escapar(preco(l).rotulo)} · ${moeda.format(preco(l).valor)}</small></div>
          <div class="sacola-qtd">
            <button type="button" data-menos="${i}" aria-label="Remove one">−</button>
            <span>${l.qtd}</span>
            <button type="button" data-mais="${i}" aria-label="Add one">+</button>
          </div>
        </li>`).join('')
      : '<li class="sacola-vazia">Your bag is empty. Tap + on any item in the lineup.</li>';
    somaTotal.textContent = moeda.format(total());
    finalizar.toggleAttribute('disabled', linhas.length === 0);
    finalizar.setAttribute('href', linkPedido());
    contador.textContent = String(quantidade());
    contador.hidden = quantidade() === 0;
    gravar(CHAVE, linhas);
  }

  function mudar(indice, delta) {
    linhas = linhas
      .map((l, i) => (i === indice ? { ...l, qtd: l.qtd + delta } : l))
      .filter((l) => l.qtd > 0);
    desenhar();
  }

  function abrir(sim) {
    painel.classList.toggle('aberta', sim);
    painel.setAttribute('aria-hidden', String(!sim));
    if (sim) fechar.focus();
  }

  // A miniatura voa do cartão até o botão da sacola.
  function voar(origem) {
    const img = origem.closest('.item')?.querySelector('img:not([hidden])');
    const destino = botoes[0];
    if (!img || !destino || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const de = img.getBoundingClientRect();
    const para = destino.getBoundingClientRect();
    const copia = img.cloneNode();
    copia.className = 'voando';
    Object.assign(copia.style, { left: `${de.left}px`, top: `${de.top}px`, width: `${de.width}px`, height: `${de.height}px` });
    document.body.appendChild(copia);
    gsap.to(copia, {
      x: para.left + para.width / 2 - (de.left + de.width / 2),
      y: para.top + para.height / 2 - (de.top + de.height / 2),
      scale: 0.08, rotation: 25, duration: 0.8, ease: 'power3.in',
      onComplete: () => {
        copia.remove();
        gsap.fromTo(destino, { scale: 1.18 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      }
    });
  }

  function adicionar(item, indicePreco, origem) {
    const existe = linhas.some((l) => l.item === item && l.preco === indicePreco);
    linhas = existe
      ? linhas.map((l) => (l.item === item && l.preco === indicePreco ? { ...l, qtd: l.qtd + 1 } : l))
      : [...linhas, { item, preco: indicePreco, qtd: 1 }];
    desenhar();
    voar(origem);
    aviso.textContent = `${cardapio[item].nome} (${cardapio[item].precos[indicePreco].rotulo}) added to the bag`;
    aviso.classList.remove('mostrar');
    void aviso.offsetWidth;
    aviso.classList.add('mostrar');
  }

  lista.addEventListener('click', (evento) => {
    const menos = evento.target.closest('[data-menos]');
    const mais = evento.target.closest('[data-mais]');
    if (menos) mudar(Number(menos.dataset.menos), -1);
    if (mais) mudar(Number(mais.dataset.mais), 1);
  });
  botoes.forEach((b) => b.addEventListener('click', () => abrir(true)));
  fechar.addEventListener('click', () => abrir(false));
  painel.addEventListener('click', (evento) => { if (evento.target === painel) abrir(false); });
  document.addEventListener('keydown', (evento) => { if (evento.key === 'Escape') abrir(false); });
  finalizar.addEventListener('click', (evento) => { if (linhas.length === 0) evento.preventDefault(); });
  if (pedido.abrirEmNovaAba) finalizar.setAttribute('target', '_blank');
  desenhar();
  return { adicionar };
}
