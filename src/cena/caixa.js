// Caixa de entrega com compartimentos e tampa articulada na borda de trás.
import * as THREE from 'three';
import * as T from './texturas.js';

export const MEDIDAS = Object.freeze({ largura: 4.2, profundidade: 2.1, altura: 1.35, parede: 0.05 });

// Onde cada item fica dentro da caixa (coordenadas da caixa, base dos itens).
export const LUGARES = Object.freeze({
  hamburguer: { x: -1.22, z: 0, escala: 0.78 },
  fritas: { x: 0.3, z: -0.32, escala: 1 },
  molho1: { x: 0.02, z: 0.62, escala: 1.25 },
  molho2: { x: 0.62, z: 0.62, escala: 1.25 },
  shake: { x: 1.52, z: 0, escala: 0.7 }
});

export function criarCaixa(marca) {
  const { largura: L, profundidade: P, altura: A, parede: e } = MEDIDAS;
  const liso = new THREE.MeshStandardMaterial({ map: T.caixaLiso(), roughness: 0.75 });
  const dentro = new THREE.MeshStandardMaterial({ color: '#101010', roughness: 0.85 });
  const vermelho = new THREE.MeshStandardMaterial({ color: '#c81e2b', roughness: 0.6 });
  const lateral = new THREE.MeshStandardMaterial({ map: T.caixaLateral(marca), roughness: 0.7 });
  const topo = new THREE.MeshStandardMaterial({ map: T.caixaTopo(marca), roughness: 0.7 });
  // Ordem das faces do BoxGeometry: +x, -x, +y, -y, +z, -z.
  const peca = (l, a, p, faces, x, y, z) => {
    const malha = new THREE.Mesh(new THREE.BoxGeometry(l, a, p), faces);
    malha.position.set(x, y, z);
    malha.castShadow = true;
    malha.receiveShadow = true;
    return malha;
  };
  const caixa = new THREE.Group();
  caixa.add(
    peca(L, e, P, dentro, 0, e / 2, 0),
    peca(L, A, e, [liso, liso, liso, liso, lateral, dentro], 0, A / 2, P / 2 - e / 2),
    peca(L, A, e, [liso, liso, liso, liso, dentro, liso], 0, A / 2, -P / 2 + e / 2),
    peca(e, A, P, [dentro, liso, liso, liso, liso, liso], -L / 2 + e / 2, A / 2, 0),
    peca(e, A, P, [vermelho, dentro, vermelho, vermelho, vermelho, vermelho], L / 2 - e / 2, A / 2, 0),
    peca(e, A * 0.8, P - 2 * e, dentro, -0.33, (A * 0.8) / 2, 0),
    peca(e, A * 0.8, P - 2 * e, dentro, 0.97, (A * 0.8) / 2, 0)
  );
  // A dobradiça fica na borda de cima, atrás. rotation.x negativo abre a tampa.
  const dobradica = new THREE.Group();
  dobradica.position.set(0, A, -P / 2);
  const tampa = peca(L + 0.04, e, P + 0.02, [liso, liso, topo, lateral, liso, liso], 0, e / 2, P / 2);
  dobradica.add(tampa);
  caixa.add(dobradica);
  caixa.userData = { dobradica };
  return caixa;
}
