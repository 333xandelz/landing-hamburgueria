// Rótulos em HTML que seguem as camadas 3D na seção The Stack.
import * as THREE from 'three';
import { escapar } from '../ui/util.js';

const limitar = (v, min, max) => Math.min(Math.max(v, min), max);

export function criarRotulos({ raiz, itens, camadas, camera, estado }) {
  raiz.innerHTML = itens.map((item, i) => `
    <div class="rotulo" data-indice="${i}">
      <span class="rotulo-linha"></span>
      <span class="rotulo-texto"><strong>${escapar(item.rotulo[0])}</strong><small>${escapar(item.rotulo[1])}</small></span>
    </div>`).join('');
  const elementos = Array.from(raiz.querySelectorAll('.rotulo'));
  const ponto = new THREE.Vector3();
  const direita = new THREE.Vector3();
  const escala = new THREE.Vector3();

  return function atualizar() {
    const visivel = estado.rotulos > 0.01;
    raiz.style.visibility = visivel ? 'visible' : 'hidden';
    if (!visivel) return;
    direita.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
    const largura = window.innerWidth;
    const altura = window.innerHeight;
    camadas.forEach((pivo, i) => {
      const { altura: espessura, raio } = pivo.userData;
      pivo.getWorldScale(escala);
      ponto.set(0, espessura / 2, 0);
      pivo.localToWorld(ponto);
      ponto.addScaledVector(direita, raio * escala.x).project(camera);
      const x = ((ponto.x + 1) / 2) * largura;
      const y = ((1 - ponto.y) / 2) * altura;
      const el = elementos[i];
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.opacity = String(limitar(estado.rotulos * 1.8 - i * 0.12, 0, 1));
      el.classList.toggle('ativo', estado.destaque === i);
    });
  };
}
