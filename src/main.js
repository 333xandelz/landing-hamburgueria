import './estilo.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import CONFIG from './config.js';
import { escapar } from './ui/util.js';
import { montarCardapio } from './ui/cardapio.js';
import { criarSacola } from './ui/sacola.js';

gsap.registerPlugin(ScrollTrigger);
document.documentElement.classList.add('js-ok');

const $ = (seletor) => document.querySelector(seletor);
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const moeda = new Intl.NumberFormat(CONFIG.moeda.locale, { style: 'currency', currency: CONFIG.moeda.codigo });

function preencherTextos() {
  document.querySelectorAll('[data-marca]').forEach((el) => { el.textContent = CONFIG.marca[el.dataset.marca] ?? ''; });
  document.querySelectorAll('[data-contato]').forEach((el) => { el.textContent = CONFIG.contato[el.dataset.contato] ?? ''; });
  document.querySelectorAll('[data-ano]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  document.title = CONFIG.marca.nome;
}

function montarFaixa() {
  const bloco = CONFIG.faixa.map((t) => `<span>${escapar(t)}</span><span class="faixa-estrela">★</span>`).join('');
  $('[data-faixa]').innerHTML = `<div class="faixa-bloco">${bloco}</div><div class="faixa-bloco">${bloco}</div>`;
}

function observarRevelacoes() {
  const alvos = document.querySelectorAll('[data-revelar]');
  if (reduzirMovimento) {
    alvos.forEach((el) => el.classList.add('visivel'));
    return;
  }
  const observador = new IntersectionObserver((entradas) => {
    entradas.filter((e) => e.isIntersecting).forEach((e) => {
      e.target.classList.add('visivel');
      observador.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  alvos.forEach((el) => observador.observe(el));
}

function rolagemSuave() {
  if (reduzirMovimento) return;
  const lenis = new Lenis({ lerp: 0.09, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((tempo) => lenis.raf(tempo * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Espera a Anton carregar (a caixa 3D imprime a marca com ela), mas não para sempre.
const fontes = () => Promise.race([
  document.fonts.load('400 80px Anton').catch(() => null),
  new Promise((pronto) => setTimeout(pronto, 2500))
]);

function semCena(erro) {
  document.documentElement.classList.add('sem-3d');
  if (erro) throw erro;
}

async function iniciar() {
  preencherTextos();
  montarFaixa();
  const sacola = criarSacola({
    config: CONFIG,
    moeda,
    painel: $('[data-sacola]'),
    botoes: [$('[data-abrir-sacola]')],
    contador: $('[data-contador]'),
    aviso: $('[data-aviso]')
  });
  const colocarMiniatura = montarCardapio($('[data-cardapio]'), CONFIG.cardapio, moeda, sacola.adicionar);
  observarRevelacoes();
  rolagemSuave();
  await fontes();

  const { suportaWebGL } = await import('./cena/palco.js');
  if (!suportaWebGL()) {
    semCena();
    return;
  }
  try {
    const { iniciarCena } = await import('./cena/iniciar.js');
    iniciarCena({ config: CONFIG, reduzirMovimento });
    const { renderizarMiniaturas } = await import('./cena/miniaturas.js');
    await renderizarMiniaturas(CONFIG.cardapio, colocarMiniatura);
    document.documentElement.classList.add('cena-pronta');
  } catch (erro) {
    semCena(erro);
  }
}

iniciar();
