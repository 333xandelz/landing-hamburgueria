// Monta a cena, liga a coreografia à rolagem e atualiza tudo a cada quadro.
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { criarPalco } from './palco.js';
import { criarHamburguer, abrirHamburguer, alturaAberta } from './hamburguer.js';
import { criarFritas, criarMilkshake, criarMolhinho } from './acompanhamentos.js';
import { criarCaixa } from './caixa.js';
import { criarCenario, opacidade } from './cenario.js';
import { criarCoreografia, VAO } from './coreografia.js';
import { criarRotulos } from './rotulos.js';
import { criarInteracao } from './interacao.js';

// Grupo externo (posição e escala, da coreografia) com um interno (balanço, do quadro).
function embrulhar(objeto) {
  const interno = new THREE.Group();
  interno.add(objeto);
  const externo = new THREE.Group();
  externo.add(interno);
  externo.userData.interno = interno;
  return externo;
}

export function iniciarCena({ config, reduzirMovimento }) {
  const palco = criarPalco(document.querySelector('[data-palco]'));
  const hamb = criarHamburguer(config.pilha.map((p) => p.camada));
  const rotador = new THREE.Group();
  const pivo = new THREE.Group();
  rotador.add(hamb);
  pivo.add(rotador);
  const fritas = embrulhar(criarFritas());
  const shake = embrulhar(criarMilkshake('chocolate'));
  const molho1 = embrulhar(criarMolhinho('#f0a64b'));
  const molho2 = embrulhar(criarMolhinho('#5a1e14'));
  const caixa = criarCaixa(config.marca);
  const { mesa, balcao, papel } = criarCenario();
  palco.cena.add(pivo, fritas, shake, molho1, molho2, caixa, mesa, balcao, papel);
  const flutuantes = [fritas, shake, molho1, molho2];

  const estado = {
    cam: new THREE.Vector3(), alvo: new THREE.Vector3(), fundo: palco.cena.background,
    abertura: 0, inclinar: 0, giro: 0, autoGiro: reduzirMovimento ? 0 : 1, giroAuto: 0, giroUsuario: 0,
    opMesa: 1, opBalcao: 0, rotulos: 0, flutuar: 0, fim: 0,
    destaque: -1, sobre: false, podeGirar: true, progresso: 0, ponteiro: { x: 0, y: 0 }
  };
  const paineis = Object.fromEntries(
    Array.from(document.querySelectorAll('[data-painel]')).map((el) => [el.dataset.painel, el])
  );
  const barra = document.querySelector('[data-progresso]');
  const dica = document.querySelector('[data-dica]');

  gsap.matchMedia().add(
    { retrato: '(max-aspect-ratio: 1/1)', paisagem: '(min-aspect-ratio: 10001/10000)' },
    (contexto) => {
      const linha = criarCoreografia({
        objetos: { pivo, fritas, shake, molho1, molho2, caixa, alturaHamb: hamb.userData.altura },
        paineis, estado, retrato: Boolean(contexto.conditions.retrato)
      });
      ScrollTrigger.create({
        trigger: '[data-experiencia]', start: 'top top', end: 'bottom bottom',
        scrub: reduzirMovimento ? true : 0.9, animation: linha,
        onUpdate: (st) => { estado.progresso = st.progress; }
      });
    }
  );

  const atualizarRotulos = criarRotulos({
    raiz: document.querySelector('[data-rotulos]'), itens: config.pilha,
    camadas: hamb.userData.camadas, camera: palco.camera, estado
  });
  const inercia = criarInteracao({ camera: palco.camera, hamb, estado });
  const olhar = { x: 0, y: 0 };

  palco.aoQuadro((dt, tempo) => {
    estado.giroAuto += dt * 0.35 * estado.autoGiro;
    inercia(dt);
    rotador.rotation.set(estado.inclinar, estado.giro + estado.giroAuto + estado.giroUsuario, 0);
    abrirHamburguer(hamb, estado.abertura, VAO);
    hamb.position.y = -alturaAberta(hamb, estado.abertura, VAO) / 2;

    const balanco = reduzirMovimento ? 0 : estado.flutuar;
    rotador.position.y = Math.sin(tempo * 1.4) * 0.05 * balanco;
    flutuantes.forEach((obj, i) => {
      const { interno } = obj.userData;
      interno.position.y = Math.sin(tempo * 1.6 + i * 1.3) * 0.09 * balanco;
      interno.rotation.y = Math.sin(tempo * 0.7 + i) * 0.3 * balanco;
    });
    hamb.userData.camadas.forEach((pivoCamada, i) => {
      const peca = pivoCamada.children[0];
      const alvo = i === estado.destaque ? 1.08 : 1;
      peca.scale.setScalar(peca.scale.x + (alvo - peca.scale.x) * Math.min(1, dt * 12));
    });

    palco.cena.fog.color.copy(estado.fundo);
    opacidade(mesa, estado.opMesa);
    opacidade(papel, estado.opMesa);
    opacidade(balcao, estado.opBalcao);

    const seguir = reduzirMovimento ? 0 : Math.min(1, dt * 3);
    olhar.x += (estado.ponteiro.x - olhar.x) * seguir;
    olhar.y += (estado.ponteiro.y - olhar.y) * seguir;
    palco.camera.position.set(estado.cam.x + olhar.x * 0.35, estado.cam.y + olhar.y * 0.2, estado.cam.z);
    palco.camera.lookAt(estado.alvo);
    palco.camera.updateMatrixWorld();

    estado.podeGirar = estado.progresso < 0.04;
    atualizarRotulos();
    if (barra) barra.style.transform = `scaleX(${estado.progresso.toFixed(4)})`;
    if (dica) dica.style.opacity = String(Math.max(0, 1 - estado.progresso * 30));
  });

  // Quando o cardápio cobre a tela inteira, a cena para de desenhar.
  new IntersectionObserver(([entrada]) => palco.rodar(entrada.isIntersecting))
    .observe(document.querySelector('[data-experiencia]'));
  return palco;
}
