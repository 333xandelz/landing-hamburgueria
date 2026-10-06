// Fritas, batata recheada, molhinhos, milkshake e refrigerante. Base de cada peça em y = 0.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as T from './texturas.js';
import { aleatorio } from './ruido.js';

let cache = null;

function materiais() {
  if (cache) return cache;
  const listra = T.listras();
  listra.wrapS = THREE.RepeatWrapping;
  listra.wrapT = THREE.RepeatWrapping;
  listra.repeat.set(1, 3);
  cache = {
    batata: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.55 }),
    caixinhaFora: new THREE.MeshStandardMaterial({ map: T.faixaFritas(), roughness: 0.6 }),
    caixinhaDentro: new THREE.MeshStandardMaterial({ color: '#8f1717', roughness: 0.8, side: THREE.BackSide }),
    bandeja: new THREE.MeshStandardMaterial({ map: T.xadrez(), roughness: 0.7, side: THREE.DoubleSide }),
    cheddar: new THREE.MeshPhysicalMaterial({ color: '#f2a516', roughness: 0.2, clearcoat: 1 }),
    baconPicado: new THREE.MeshStandardMaterial({ color: '#8e2b1e', roughness: 0.5 }),
    cebolinha: new THREE.MeshStandardMaterial({ color: '#5fb83c', roughness: 0.5 }),
    pimenta: new THREE.MeshPhysicalMaterial({ color: '#3f8f2b', roughness: 0.3, clearcoat: 0.6 }),
    papel: new THREE.MeshStandardMaterial({ color: '#f4f1ec', roughness: 0.75, side: THREE.DoubleSide }),
    vidro: new THREE.MeshPhysicalMaterial({
      color: '#ffffff', transmission: 1, roughness: 0.06, thickness: 0.08, ior: 1.45, transparent: true, side: THREE.DoubleSide
    }),
    chantilly: new THREE.MeshPhysicalMaterial({ color: '#fffaf2', roughness: 0.65, sheen: 0.5, sheenColor: new THREE.Color('#ffffff') }),
    cereja: new THREE.MeshPhysicalMaterial({ color: '#c8102e', roughness: 0.15, clearcoat: 1 }),
    cabinho: new THREE.MeshStandardMaterial({ color: '#5b3a1a', roughness: 0.6 }),
    canudo: new THREE.MeshStandardMaterial({ map: listra, roughness: 0.35 }),
    logoCopo: new THREE.MeshStandardMaterial({ map: T.logoCopo(), transparent: true, alphaTest: 0.1, roughness: 0.4 }),
    copoRefri: new THREE.MeshStandardMaterial({ map: T.copoRefri(), roughness: 0.6 }),
    tampa: new THREE.MeshStandardMaterial({ color: '#f7f5f0', roughness: 0.4 }),
    canudoPreto: new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.4 })
  };
  return cache;
}

const SABORES = Object.freeze({
  chocolate: ['#6e3f28', '#3a1b0e'],
  morango: ['#f19db3', '#c23b5a'],
  baunilha: ['#f4e3bd', '#c99a4b']
});

const sombras = (objeto) => {
  objeto.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return objeto;
};

const tons = ['#f7c14d', '#f2b23a', '#fbd26a', '#e9a12c', '#f5bb44'].map((c) => new THREE.Color(c));

// Batatas em pé (caixinha) ou deitadas (bandeja), num InstancedMesh com tons variados.
function batatas(quantidade, semente, posicionar) {
  const geo = new RoundedBoxGeometry(0.075, 1, 0.075, 2, 0.02);
  const malha = new THREE.InstancedMesh(geo, materiais().batata, quantidade);
  const r = aleatorio(semente);
  const m = new THREE.Matrix4();
  for (let i = 0; i < quantidade; i += 1) {
    const { posicao, giro, escala } = posicionar(r, i);
    m.compose(posicao, new THREE.Quaternion().setFromEuler(giro), escala);
    malha.setMatrixAt(i, m);
    malha.setColorAt(i, tons[i % tons.length]);
  }
  return malha;
}

function caixinha(raioTopo, raioBase, altura) {
  const geo = new THREE.CylinderGeometry(raioTopo, raioBase, altura, 4, 1, true).rotateY(Math.PI / 4).translate(0, altura / 2, 0);
  const fundo = new THREE.PlaneGeometry(raioBase * 1.41, raioBase * 1.41).rotateX(-Math.PI / 2).translate(0, 0.01, 0);
  const grupo = new THREE.Group();
  grupo.add(new THREE.Mesh(geo, materiais().caixinhaFora), new THREE.Mesh(geo, materiais().caixinhaDentro), new THREE.Mesh(fundo, materiais().caixinhaDentro));
  return grupo;
}

export function criarFritas() {
  const grupo = caixinha(0.46, 0.34, 0.75);
  grupo.add(batatas(30, 91, (r) => {
    const h = 0.75 + r() * 0.35;
    return {
      posicao: new THREE.Vector3((r() - 0.5) * 0.5, 0.1 + h / 2, (r() - 0.5) * 0.5),
      giro: new THREE.Euler((r() - 0.5) * 0.3, r() * Math.PI, (r() - 0.5) * 0.3),
      escala: new THREE.Vector3(1, h, 1)
    };
  }));
  return sombras(grupo);
}

export function criarBatataRecheada() {
  const m = materiais();
  const grupo = new THREE.Group();
  const geo = new THREE.CylinderGeometry(0.95, 0.75, 0.32, 4, 1, true).rotateY(Math.PI / 4).translate(0, 0.16, 0);
  const bandeja = new THREE.Mesh(geo, m.bandeja);
  bandeja.scale.z = 0.72;
  grupo.add(bandeja);
  grupo.add(batatas(46, 93, (r) => ({
    posicao: new THREE.Vector3((r() - 0.5) * 1.05, 0.2 + r() * 0.18, (r() - 0.5) * 0.7),
    giro: new THREE.Euler(Math.PI / 2 + (r() - 0.5) * 0.4, 0, r() * Math.PI),
    escala: new THREE.Vector3(1, 0.55 + r() * 0.25, 1)
  })));
  const r = aleatorio(95);
  const fios = [0, 1, 2].map((i) => {
    const z = -0.22 + i * 0.22;
    const pontos = Array.from({ length: 7 }, (_, k) => new THREE.Vector3(-0.55 + k * 0.18, 0.42 + Math.sin(k * 1.3 + i) * 0.04, z + Math.sin(k * 2 + i) * 0.1));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pontos), 48, 0.045, 8, false);
  });
  grupo.add(new THREE.Mesh(mergeGeometries(fios), m.cheddar));
  const pedacos = (geometria, material, quantidade, altura) => {
    const malha = new THREE.InstancedMesh(geometria, material, quantidade);
    const mtx = new THREE.Matrix4();
    for (let i = 0; i < quantidade; i += 1) {
      const p = new THREE.Vector3((r() - 0.5) * 1.0, altura + r() * 0.05, (r() - 0.5) * 0.6);
      mtx.compose(p, new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3)), new THREE.Vector3(1, 1, 1));
      malha.setMatrixAt(i, mtx);
    }
    return malha;
  };
  grupo.add(
    pedacos(new THREE.BoxGeometry(0.07, 0.035, 0.05), m.baconPicado, 34, 0.44),
    pedacos(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 8), m.cebolinha, 50, 0.46),
    pedacos(new THREE.TorusGeometry(0.05, 0.018, 8, 16), m.pimenta, 6, 0.45)
  );
  return sombras(grupo);
}

export function criarMolhinho(cor) {
  const copo = new THREE.LatheGeometry([[0.001, 0], [0.16, 0], [0.205, 0.14], [0.22, 0.15], [0.2, 0.15]].map(([x, y]) => new THREE.Vector2(x, y)), 48);
  const molho = new THREE.CircleGeometry(0.19, 40).rotateX(-Math.PI / 2).translate(0, 0.125, 0);
  const grupo = new THREE.Group();
  grupo.add(
    new THREE.Mesh(copo, materiais().papel),
    new THREE.Mesh(molho, new THREE.MeshPhysicalMaterial({ color: cor, roughness: 0.2, clearcoat: 1 }))
  );
  return sombras(grupo);
}

const v2 = (pontos) => pontos.map(([x, y]) => new THREE.Vector2(x, y));

export function criarMilkshake(sabor = 'chocolate') {
  const m = materiais();
  const [cor, calda] = SABORES[sabor] || SABORES.chocolate;
  const grupo = new THREE.Group();
  const copo = new THREE.LatheGeometry(v2([[0.001, 0], [0.28, 0], [0.4, 1.0], [0.425, 1.03], [0.405, 1.03]]), 64);
  const conteudo = new THREE.LatheGeometry(v2([[0.001, 0.02], [0.265, 0.02], [0.375, 0.97], [0.001, 0.97]]), 64);
  const doce = new THREE.MeshStandardMaterial({ map: T.conteudoShake(cor, calda), roughness: 0.5 });
  const bolas = [[0, 1.02, 0, 0.36], [0, 1.24, 0, 0.24], [0, 1.4, 0, 0.13]]
    .concat(Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2;
      return [Math.cos(a) * 0.24, 1.07, Math.sin(a) * 0.24, 0.17];
    }))
    .map(([x, y, z, raio]) => new THREE.SphereGeometry(raio, 24, 16).translate(x, y, z));
  const canudo = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.5, 16), m.canudo);
  canudo.position.set(0.16, 1.15, 0.06);
  canudo.rotation.z = -0.28;
  const cereja = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 16), m.cereja);
  cereja.position.set(0.02, 1.58, 0);
  const curva = new THREE.CatmullRomCurve3([new THREE.Vector3(0.02, 1.66, 0), new THREE.Vector3(0.06, 1.78, 0), new THREE.Vector3(0.14, 1.84, 0)]);
  const logo = new THREE.Mesh(new THREE.CylinderGeometry(0.365, 0.33, 0.42, 48, 1, true, -0.6, 1.2), m.logoCopo);
  logo.position.y = 0.48;
  grupo.add(
    new THREE.Mesh(conteudo, doce),
    canudo,
    new THREE.Mesh(copo, m.vidro),
    new THREE.Mesh(mergeGeometries(bolas), m.chantilly),
    cereja,
    new THREE.Mesh(new THREE.TubeGeometry(curva, 12, 0.012, 6), m.cabinho),
    logo
  );
  return sombras(grupo);
}

export function criarRefrigerante() {
  const m = materiais();
  const grupo = new THREE.Group();
  const copo = new THREE.LatheGeometry(v2([[0.001, 0], [0.26, 0], [0.36, 1.0], [0.001, 1.0]]), 64);
  const tampa = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.38, 0.06, 48), m.tampa);
  tampa.position.y = 1.02;
  const canudo = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 12), m.canudoPreto);
  canudo.position.set(0.05, 1.32, 0);
  canudo.rotation.z = -0.15;
  grupo.add(new THREE.Mesh(copo, m.copoRefri), tampa, canudo);
  return sombras(grupo);
}
