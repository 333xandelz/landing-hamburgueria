/*
 * A linha do tempo da rolagem, na ordem do vídeo de referência:
 * hero no papel manteiga → levanta e gira ("Smashed to order") → explode com rótulos
 * ("The Stack") → fecha e os acompanhamentos chegam voando → tudo cai na caixa
 * ("Game Day Combo") → a tampa fecha ("Overtime Shakes").
 * A linha é construída pausada; quem a liga à rolagem é o main.js (ScrollTrigger).
 */
import gsap from 'gsap';
import * as THREE from 'three';
import { LUGARES, MEDIDAS } from './caixa.js';

export const VAO = 0.62;
export const TAMPA_ABERTA = -1.95;

const CORES = Object.freeze({
  claro: new THREE.Color('#ece8e1'),
  inox: new THREE.Color('#1b1c1f')
});

// Enquadramentos por formato de tela: câmera, ponto de mira e posições dos objetos.
const QUADROS = Object.freeze({
  paisagem: {
    heroi: { cam: [-0.75, 2.05, 6.9], alvo: [-0.75, 0.82, 0] },
    smash: { cam: [0.2, 2.6, 7.6], alvo: [0.7, 2.0, 0], hamb: [-1.0, 2.1, 0] },
    pilha: { cam: [0, 2.5, 9.8], alvo: [0.3, 2.25, 0], hamb: [0.15, 2.3, 0] },
    lados: {
      cam: [0, 2.3, 8.8], alvo: [0, 1.85, 0], hamb: [0, 2.0, 0],
      fritas: [-2.6, 0.95, 0.4], shake: [2.6, 0.85, 0.2], molho1: [-1.7, 3.05, -0.6], molho2: [1.8, 3.25, -0.8]
    },
    caixaAberta: { cam: [1.6, 6.6, 10.8], alvo: [1.4, 0.95, 0.3] },
    caixaFechada: { cam: [-0.6, 2.2, 8.6], alvo: [-1.2, 0.72, 0] }
  },
  retrato: {
    heroi: { cam: [0, 2.3, 7.4], alvo: [0, 1.55, 0] },
    smash: { cam: [0, 2.0, 8.2], alvo: [0, 1.15, 0], hamb: [0, 2.1, 0] },
    pilha: { cam: [0, 3.0, 11.6], alvo: [0, 2.85, 0], hamb: [-0.6, 2.35, 0] },
    lados: {
      cam: [0, 2.4, 10.6], alvo: [0, 2.15, 0], hamb: [0, 2.45, 0],
      fritas: [-1.3, 0.55, 0.5], shake: [1.3, 0.45, 0.4], molho1: [-1.0, 4.0, -0.4], molho2: [1.0, 4.2, -0.6]
    },
    caixaAberta: { cam: [0, 8.4, 9.6], alvo: [0, -0.6, 0.3] },
    caixaFechada: { cam: [0.6, 3.0, 12], alvo: [0, 0.0, 0] }
  }
});

const xyz = ([x, y, z]) => ({ x, y, z });
const rgb = (cor) => ({ r: cor.r, g: cor.g, b: cor.b });

export function criarCoreografia({ objetos, paineis, estado, retrato }) {
  const Q = retrato ? QUADROS.retrato : QUADROS.paisagem;
  const { pivo, fritas, shake, molho1, molho2, caixa, alturaHamb } = objetos;
  const piso = MEDIDAS.parede;
  const lados = [[fritas, 'fritas', [-8, 4, -2]], [shake, 'shake', [8, 3.5, -2]], [molho1, 'molho1', [-6, 6, -3]], [molho2, 'molho2', [6, 6.5, -3]]];

  // Estado inicial (gsap.set: desfeito sozinho quando o formato de tela muda).
  gsap.set(pivo.position, { x: 0, y: alturaHamb / 2 + 0.006, z: 0 });
  gsap.set(pivo.scale, { x: 1, y: 1, z: 1 });
  gsap.set(estado.cam, xyz(Q.heroi.cam));
  gsap.set(estado.alvo, xyz(Q.heroi.alvo));
  lados.forEach(([obj, , fora]) => {
    gsap.set(obj.position, xyz(fora));
    gsap.set(obj.rotation, { x: 1.2, y: 2.5, z: -0.8 });
    gsap.set(obj, { visible: false });
  });
  gsap.set(caixa, { visible: false });
  gsap.set(caixa.position, { y: -3.2 });
  gsap.set(caixa.userData.dobradica.rotation, { x: TAMPA_ABERTA });
  gsap.set(Object.values(paineis).filter((p) => p !== paineis.heroi), { autoAlpha: 0 });

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut', duration: 1 } });
  const ir = (alvo, ponto, tempo, extra = {}) => tl.to(alvo, { ...xyz(ponto), ...extra }, tempo);
  const enquadrar = (quadro, tempo, duracao) => {
    ir(estado.cam, quadro.cam, tempo, { duration: duracao });
    ir(estado.alvo, quadro.alvo, tempo, { duration: duracao });
  };
  const entrar = (painel, tempo, de = { y: 50 }) =>
    tl.fromTo(painel, { autoAlpha: 0, ...de }, { autoAlpha: 1, x: 0, y: 0, duration: 0.5, ease: 'power2.out' }, tempo);
  const sair = (painel, tempo) => tl.to(painel, { autoAlpha: 0, y: -40, duration: 0.4, ease: 'power1.in' }, tempo);

  // 1. Levanta do papel e dá uma volta inteira.
  tl.to(estado, { autoGiro: 0, duration: 0.4 }, 0);
  sair(paineis.heroi, 0.15);
  ir(pivo.position, Q.smash.hamb, 0.2, { duration: 1.7 });
  tl.to(estado, { giro: Math.PI * 2, duration: 2.4, ease: 'power1.inOut' }, 0.2);
  tl.to(estado, { abertura: 0.3, duration: 1.4 }, 0.7);
  enquadrar(Q.smash, 0.2, 1.8);
  tl.to(estado, { opMesa: 0, duration: 0.8 }, 1.4);
  entrar(paineis.smash, 0.9, { x: 60, y: 0 });
  sair(paineis.smash, 2.3);

  // 2. The Stack: fundo claro, pilha aberta e inclinada, rótulos.
  tl.to(estado.fundo, { ...rgb(CORES.claro), duration: 0.8 }, 2.3);
  ir(pivo.position, Q.pilha.hamb, 2.4, { duration: 1.2 });
  enquadrar(Q.pilha, 2.4, 1.2);
  tl.to(estado, { abertura: 1, inclinar: 0.3, duration: 1.2 }, 2.4);
  entrar(paineis.pilha, 3.0);
  tl.to(estado, { rotulos: 1, duration: 0.5, ease: 'none' }, 3.2);
  tl.to(estado, { rotulos: 0, duration: 0.3, ease: 'none' }, 4.4);

  // 3. Fecha a pilha e os acompanhamentos chegam voando.
  tl.to(estado, { abertura: 0, inclinar: 0.08, duration: 0.8 }, 4.5);
  ir(pivo.position, Q.lados.hamb, 4.5, { duration: 0.8 });
  enquadrar(Q.lados, 4.5, 0.9);
  lados.forEach(([obj, nome], i) => {
    const t = 4.6 + i * 0.08;
    tl.set(obj, { visible: true }, t);
    ir(obj.position, Q.lados[nome], t, { duration: 0.8, ease: 'power3.out' });
    tl.to(obj.rotation, { x: 0.15, y: 0.4, z: 0.1, duration: 0.8, ease: 'power3.out' }, t);
  });
  tl.to(estado, { flutuar: 1, duration: 0.4 }, 4.9);
  sair(paineis.pilha, 5.4);

  // 4. Balcão de inox, a caixa sobe e cada item para em cima do seu compartimento.
  tl.to(estado.fundo, { ...rgb(CORES.inox), duration: 0.8 }, 5.6);
  tl.to(estado, { opBalcao: 1, flutuar: 0, inclinar: 0, duration: 0.8 }, 5.6);
  tl.set(caixa, { visible: true }, 5.6);
  tl.to(caixa.position, { y: 0, duration: 0.9, ease: 'power3.out' }, 5.6);
  enquadrar(Q.caixaAberta, 5.6, 1);
  const pairar = (obj, lugar, altura, tempo) => {
    ir(obj.position, [lugar.x, altura, lugar.z], tempo, { duration: 0.7 });
    tl.to(obj.scale, { x: lugar.escala, y: lugar.escala, z: lugar.escala, duration: 0.7 }, tempo);
  };
  pairar(pivo, LUGARES.hamburguer, 2.7, 5.8);
  lados.forEach(([obj, nome], i) => {
    pairar(obj, LUGARES[nome], 2.9 + i * 0.15, 5.85 + i * 0.05);
    tl.to(obj.rotation, { x: 0, y: 0, z: 0, duration: 0.7 }, 5.85 + i * 0.05);
  });
  entrar(paineis.combo, 6.2, { x: 60, y: 0 });

  // 5. A queda: o hambúrguer amassa um pouco ao cair, o resto quica.
  const escala = LUGARES.hamburguer.escala;
  tl.to(pivo.position, { y: piso + (alturaHamb * escala) / 2, duration: 0.45, ease: 'power3.in' }, 6.5);
  tl.to(pivo.scale, { y: escala * 0.86, duration: 0.08, ease: 'power1.out' }, 6.95);
  tl.to(pivo.scale, { y: escala, duration: 0.3, ease: 'back.out(3)' }, 7.03);
  lados.forEach(([obj], i) => {
    tl.to(obj.position, { y: piso, duration: 0.5, ease: 'bounce.out' }, 6.65 + i * 0.1);
  });
  sair(paineis.combo, 7.6);

  // 6. A tampa fecha e a câmera mostra a caixa de frente.
  tl.to(caixa.userData.dobradica.rotation, { x: 0, duration: 1, ease: 'power2.inOut' }, 7.7);
  enquadrar(Q.caixaFechada, 7.6, 1.4);
  entrar(paineis.shakes, 8.2);
  tl.to(estado, { fim: 1, duration: 1.2, ease: 'none' }, 8.8);
  return tl;
}
