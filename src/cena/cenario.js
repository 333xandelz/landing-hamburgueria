// Mesa de madeira com papel manteiga (abertura) e balcão de inox (caixa de entrega).
import * as THREE from 'three';
import * as T from './texturas.js';
import { fbm } from './ruido.js';

function piso(material) {
  const malha = new THREE.Mesh(new THREE.PlaneGeometry(60, 60).rotateX(-Math.PI / 2), material);
  malha.receiveShadow = true;
  return malha;
}

export function criarCenario() {
  const mesa = piso(new THREE.MeshStandardMaterial({ map: T.madeira(), color: '#8c7060', roughness: 0.55, envMapIntensity: 0.4, transparent: true }));
  const balcao = piso(new THREE.MeshStandardMaterial({
    map: T.inox(), color: '#7d8188', metalness: 0.8, roughness: 0.42, envMapIntensity: 0.55, transparent: true, opacity: 0
  }));
  balcao.position.y = -0.001;
  balcao.visible = false;
  return { mesa, balcao, papel: criarPapel() };
}

// Papel manteiga levemente amassado, com as bordas serrilhadas.
export function criarPapel() {
  const geo = new THREE.PlaneGeometry(3.6, 2.6, 48, 36).rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, 0.012 * (fbm(x * 2.2, z * 2.2, 3) + 1) + 0.03 * Math.max(0, Math.abs(x) - 1.4));
  }
  geo.computeVertexNormals();
  const papel = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    map: T.papel(), alphaMap: T.alfaPapel(), alphaTest: 0.5, transparent: true, roughness: 0.92, side: THREE.DoubleSide
  }));
  papel.position.y = 0.004;
  papel.rotation.y = 0.16;
  papel.receiveShadow = true;
  return papel;
}

// Esconde a peça quando a opacidade zera, para não pesar no quadro.
export function opacidade(malha, valor) {
  malha.material.opacity = valor;
  malha.visible = valor > 0.001;
}
