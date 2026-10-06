/*
 * Liga a página: preenche marca e contato, desenha as ilustrações, monta o cardápio e a
 * faixa, e cuida das animações de rolagem (revelação dos blocos e a pilha que se abre).
 */
(function () {
  'use strict';

  const C = window.CONFIG;
  const A = window.Arte;
  if (!C || !A) throw new Error('config.js ou js/arte/*.js não carregou antes de main.js');

  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const moeda = new Intl.NumberFormat(C.moeda.locale, { style: 'currency', currency: C.moeda.codigo });
  const limitar = (valor, min, max) => Math.min(Math.max(valor, min), max);
  const suavizar = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function preencherTextos() {
    document.querySelectorAll('[data-marca]').forEach((el) => {
      el.textContent = C.marca[el.dataset.marca] ?? '';
    });
    document.querySelectorAll('[data-contato]').forEach((el) => {
      el.textContent = C.contato[el.dataset.contato] ?? '';
    });
    document.querySelectorAll('[data-ano]').forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
    document.title = C.marca.nome;
  }

  function ligarPedidos() {
    document.querySelectorAll('[data-pedido]').forEach((el) => {
      el.setAttribute('href', C.pedido.url);
      if (C.pedido.abrirEmNovaAba) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      }
    });
  }

  function desenharIlustracoes() {
    document.body.insertAdjacentHTML('afterbegin', A.definicoes());
    document.querySelectorAll('[data-ilustracao]').forEach((el) => {
      el.innerHTML = A.desenhar(el.dataset.ilustracao, C);
    });
  }

  function cartao(produto, indice) {
    const precos = produto.precos
      .map((p) => `<li><span>${A.escapar(p.rotulo)}</span><strong>${moeda.format(p.valor)}</strong></li>`)
      .join('');
    return `
      <article class="item" data-revelar style="--atraso:${indice % 3}">
        <div class="item-arte item-arte--${produto.ilustracao.fundo || 'escuro'}">${A.item(produto.ilustracao, produto.nome)}</div>
        <h3 class="item-nome titulo-fantasma">${A.escapar(produto.nome)}</h3>
        <p class="item-desc">${A.escapar(produto.descricao)}</p>
        <div class="item-rodape">
          <ul class="item-precos">${precos}</ul>
          <a class="botao botao-contorno" data-pedido href="#menu">Order now</a>
        </div>
      </article>`;
  }

  function montarCardapio() {
    const grade = document.querySelector('[data-cardapio]');
    if (!grade) return;
    grade.innerHTML = C.cardapio.map(cartao).join('');
  }

  // A faixa é repetida duas vezes para o loop da animação não ter emenda.
  function montarFaixa() {
    const trilho = document.querySelector('[data-faixa]');
    if (!trilho) return;
    const bloco = C.faixa.map((texto) => `<span>${A.escapar(texto)}</span><span class="faixa-estrela">★</span>`).join('');
    trilho.innerHTML = `<div class="faixa-bloco">${bloco}</div><div class="faixa-bloco" aria-hidden="true">${bloco}</div>`;
  }

  function observarRevelacoes() {
    const alvos = document.querySelectorAll('[data-revelar]');
    if (reduzirMovimento || !('IntersectionObserver' in window)) {
      alvos.forEach((el) => el.classList.add('visivel'));
      return;
    }
    const observador = new IntersectionObserver((entradas) => {
      entradas.filter((e) => e.isIntersecting).forEach((e) => {
        e.target.classList.add('visivel');
        observador.unobserve(e.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    alvos.forEach((el) => observador.observe(el));
  }

  // A pilha abre conforme a seção atravessa a tela; abertura vai de 0 (montado) a 1 (explodido).
  function animarPilha() {
    const secao = document.querySelector('[data-pilha]');
    if (!secao) return;
    const camadas = Array.from(secao.querySelectorAll('.camada'));
    const centro = (camadas.length - 1) / 2;
    const aplicar = (abertura) => {
      camadas.forEach((el) => {
        const deslocamento = (Number(el.dataset.indice) - centro) * A.VAO_PILHA * abertura;
        el.style.transform = `translateY(${deslocamento.toFixed(2)}px)`;
      });
      secao.style.setProperty('--abertura', abertura.toFixed(3));
    };
    if (reduzirMovimento) {
      aplicar(1);
      return;
    }
    let agendado = false;
    const medir = () => {
      agendado = false;
      const caixa = secao.getBoundingClientRect();
      const curso = caixa.height - window.innerHeight;
      const progresso = curso > 0 ? limitar(-caixa.top / curso, 0, 1) : 1;
      aplicar(suavizar(limitar(progresso / 0.75, 0, 1)));
    };
    const agendar = () => {
      if (agendado) return;
      agendado = true;
      window.requestAnimationFrame(medir);
    };
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar);
    medir();
  }

  function marcarTopo() {
    const topo = document.querySelector('.topo');
    if (!topo) return;
    const atualizar = () => topo.classList.toggle('topo--rolado', window.scrollY > 24);
    window.addEventListener('scroll', atualizar, { passive: true });
    atualizar();
  }

  preencherTextos();
  desenharIlustracoes();
  montarCardapio();
  montarFaixa();
  ligarPedidos();
  observarRevelacoes();
  animarPilha();
  marcarTopo();
  document.documentElement.classList.add('pronto');
})();
