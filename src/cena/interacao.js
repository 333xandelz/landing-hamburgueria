// Mouse sobre a cena: arrastar gira o hambúrguer no topo, passar o mouse destaca a camada.
import * as THREE from 'three';

export function criarInteracao({ camera, hamb, estado }) {
  const raio = new THREE.Raycaster();
  const ponteiro = new THREE.Vector2();
  const malhas = [];
  hamb.traverse((o) => { if (o.isMesh) malhas.push(o); });
  const raiz = document.documentElement;
  let arrastando = false;
  let ultimoX = 0;
  let velocidade = 0;

  const camadaDe = (objeto) => {
    let atual = objeto;
    while (atual && atual.userData.ordem === undefined) atual = atual.parent;
    return atual ? hamb.userData.camadas.indexOf(atual) : -1;
  };

  function mirar(evento) {
    ponteiro.set((evento.clientX / window.innerWidth) * 2 - 1, -(evento.clientY / window.innerHeight) * 2 + 1);
    raio.setFromCamera(ponteiro, camera);
    const acerto = raio.intersectObjects(malhas, false)[0];
    estado.sobre = Boolean(acerto);
    estado.destaque = acerto && estado.rotulos > 0.5 ? camadaDe(acerto.object) : -1;
    raiz.classList.toggle('pode-girar', estado.sobre && estado.podeGirar);
  }

  window.addEventListener('pointermove', (evento) => {
    estado.ponteiro.x = (evento.clientX / window.innerWidth) * 2 - 1;
    estado.ponteiro.y = -(evento.clientY / window.innerHeight) * 2 + 1;
    if (arrastando) {
      velocidade = (evento.clientX - ultimoX) * 0.012;
      ultimoX = evento.clientX;
      estado.giroUsuario += velocidade;
      return;
    }
    if (evento.pointerType === 'mouse') mirar(evento);
  }, { passive: true });

  window.addEventListener('pointerdown', (evento) => {
    if (evento.button !== 0 || evento.pointerType === 'touch') return;
    if (evento.target.closest('a, button, input, .sacola')) return;
    mirar(evento);
    if (!estado.sobre || !estado.podeGirar) return;
    arrastando = true;
    ultimoX = evento.clientX;
    raiz.classList.add('girando');
  });

  window.addEventListener('pointerup', () => {
    arrastando = false;
    raiz.classList.remove('girando');
  });

  // Inércia depois de soltar o mouse.
  return (dt) => {
    if (arrastando) return;
    estado.giroUsuario += velocidade;
    velocidade *= Math.pow(0.02, dt);
  };
}
