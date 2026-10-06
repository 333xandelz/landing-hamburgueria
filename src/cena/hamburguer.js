// O hambúrguer em 3D, camada por camada. Cada camada nasce com a base em y = 0.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as T from './texturas.js';
import { aleatorio, fbm } from './ruido.js';

let cache = null;

function materiais() {
  if (cache) return cache;
  cache = {
    pao: new THREE.MeshPhysicalMaterial({
      vertexColors: true, roughness: 0.55, clearcoat: 0.45, clearcoatRoughness: 0.35,
      bumpMap: T.relevo(5, 1800), bumpScale: 0.8
    }),
    gergelim: new THREE.MeshStandardMaterial({ color: '#fbf0d6', roughness: 0.45 }),
    carne: new THREE.MeshStandardMaterial({ map: T.carne(), bumpMap: T.relevo(13, 4200), bumpScale: 2, roughness: 0.72 }),
    queijo: new THREE.MeshPhysicalMaterial({
      color: '#ffb000', roughness: 0.5, clearcoat: 0.15, clearcoatRoughness: 0.4, envMapIntensity: 0.5,
      alphaMap: T.alfaQueijo(), alphaTest: 0.5, side: THREE.DoubleSide
    }),
    molho: new THREE.MeshPhysicalMaterial({ color: '#d4501c', roughness: 0.38, clearcoat: 0.5, envMapIntensity: 0.6 }),
    cebolaClara: new THREE.MeshPhysicalMaterial({ color: '#b5651f', roughness: 0.32, clearcoat: 0.8 }),
    cebolaEscura: new THREE.MeshPhysicalMaterial({ color: '#6e2f0e', roughness: 0.32, clearcoat: 0.8 }),
    alface: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, side: THREE.DoubleSide }),
    tomateTampa: new THREE.MeshPhysicalMaterial({ map: T.tomate(), roughness: 0.25, clearcoat: 0.7 }),
    tomateLado: new THREE.MeshStandardMaterial({ color: '#b71f17', roughness: 0.4 }),
    bacon: new THREE.MeshPhysicalMaterial({ map: T.bacon(), roughness: 0.45, clearcoat: 0.4, side: THREE.DoubleSide }),
    piclesTampa: new THREE.MeshPhysicalMaterial({ map: T.picles(), roughness: 0.3, clearcoat: 0.5 }),
    piclesLado: new THREE.MeshStandardMaterial({ color: '#4f7a24', roughness: 0.5 })
  };
  return cache;
}

const suave = (t) => t * t * (3 - 2 * t);

function colorir(geometria, corPara) {
  const pos = geometria.attributes.position;
  const cores = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i += 1) {
    corPara(pos.getX(i), pos.getY(i), pos.getZ(i), c);
    cores.set([c.r, c.g, c.b], i * 3);
  }
  geometria.setAttribute('color', new THREE.BufferAttribute(cores, 3));
  return geometria;
}

// Desloca cada vértice com uma função (x, y, z) => [x, y, z] e recalcula as normais.
function deformar(geometria, funcao) {
  const pos = geometria.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const [x, y, z] = funcao(pos.getX(i), pos.getY(i), pos.getZ(i));
    pos.setXYZ(i, x, y, z);
  }
  geometria.computeVertexNormals();
  return geometria;
}

const perfil = (pontos, resolucao = 40) =>
  new THREE.SplineCurve(pontos.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(resolucao);

function irregular(amplitude, frequencia) {
  return (x, y, z) => {
    const d = Math.hypot(x, z);
    if (d < 0.01) return [x, y, z];
    const f = 1 + amplitude * fbm(x * frequencia + 7, y * frequencia, z * frequencia);
    return [x * f, y + amplitude * 0.6 * fbm(x * 3, z * 3, 5), z * f];
  };
}

function sementes(R, H, quantidade) {
  const m = materiais();
  const malha = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 6), m.gergelim, quantidade);
  const r = aleatorio(17);
  const eixoY = new THREE.Vector3(0, 1, 0);
  const matriz = new THREE.Matrix4();
  for (let i = 0; i < quantidade; i += 1) {
    const ang = 0.3 + r() * 1.2;
    const phi = r() * Math.PI * 2;
    const raio = R * Math.cos(ang) * 0.985;
    const y = 0.09 + (H - 0.09) * Math.pow(Math.sin(ang), 0.75);
    const p = new THREE.Vector3(Math.cos(phi) * raio, y + 0.004, Math.sin(phi) * raio);
    const normal = new THREE.Vector3(p.x / (R * R), (y - 0.09) / ((H - 0.09) ** 2), p.z / (R * R)).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(eixoY, normal)
      .multiply(new THREE.Quaternion().setFromAxisAngle(eixoY, r() * Math.PI));
    matriz.compose(p, q, new THREE.Vector3(0.042, 0.011, 0.022));
    malha.setMatrixAt(i, matriz);
  }
  return malha;
}

function paoTopo() {
  const R = 1.06;
  const H = 0.74;
  const pontos = [[0.001, 0], [R * 0.9, 0], [R * 0.985, 0.03], [R, 0.09]];
  for (let i = 1; i <= 16; i += 1) {
    const ang = (i / 16) * (Math.PI / 2);
    pontos.push([Math.max(R * Math.cos(ang), 0.001), 0.09 + (H - 0.09) * Math.pow(Math.sin(ang), 0.75)]);
  }
  const base = new THREE.Color('#e2a862');
  const meio = new THREE.Color('#bd7432');
  const topo = new THREE.Color('#8c4a1c');
  const miolo = new THREE.Color('#efd3a0');
  const geo = colorir(new THREE.LatheGeometry(perfil(pontos, 48), 120), (x, y, z, c) => {
    if (y < 0.004) return c.copy(miolo);
    const t = y / H + fbm(x * 3, y * 3, z * 3) * 0.08;
    return t < 0.2 ? c.copy(base).lerp(meio, suave(Math.max(t, 0) / 0.2)) : c.copy(meio).lerp(topo, Math.min(1, (t - 0.2) / 0.8));
  });
  deformar(geo, irregular(0.012, 2.2));
  const grupo = new THREE.Group();
  grupo.add(new THREE.Mesh(geo, materiais().pao), sementes(R, H, 54));
  return grupo;
}

function paoBase() {
  const R = 1.04;
  const H = 0.34;
  const pontos = [[0.001, 0], [R * 0.86, 0], [R * 0.96, 0.03], [R, 0.1], [R * 1.005, 0.2], [R * 0.99, 0.28], [R * 0.95, 0.325], [R * 0.88, H], [0.001, H]];
  const lado = new THREE.Color('#9a5320');
  const alto = new THREE.Color('#d4934a');
  const miolo = new THREE.Color('#f1d29b');
  const geo = colorir(new THREE.LatheGeometry(perfil(pontos, 40), 120), (x, y, z, c) => {
    if (y > H - 0.006 && Math.hypot(x, z) < R * 0.86) return c.copy(miolo);
    return c.copy(lado).lerp(alto, Math.min(1, y / H + fbm(x * 3, y * 3, z * 3) * 0.1));
  });
  return new THREE.Mesh(deformar(geo, irregular(0.01, 2)), materiais().pao);
}

function carne() {
  const pontos = [[0.001, 0], [0.6, -0.005], [0.95, 0.01], [1.04, 0.06], [1.07, 0.13], [1.04, 0.21], [0.95, 0.255], [0.6, 0.265], [0.001, 0.26]];
  const geo = new THREE.LatheGeometry(perfil(pontos, 36), 160);
  deformar(geo, (x, y, z) => {
    const d = Math.hypot(x, z);
    if (d < 0.01) return [x, y, z];
    const a = Math.atan2(z, x);
    const borda = 0.06 * fbm(Math.cos(a) * 3, Math.sin(a) * 3, 1) + 0.035 * fbm(Math.cos(a) * 14, Math.sin(a) * 14, y * 6);
    const f = 1 + borda * suave(Math.min(1, d / 1.0));
    const relevo = (y > 0.2 ? 0.025 : -0.015) * fbm(x * 4, z * 4, 2) * Math.min(1, d);
    return [x * f, y + relevo, z * f];
  });
  const mapa = materiais().carne;
  return new THREE.Mesh(geo, mapa);
}

const DIFERENCA = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

function fatiaQueijo(giro, semente) {
  const geo = new THREE.PlaneGeometry(2.2, 2.2, 72, 72).rotateX(-Math.PI / 2);
  const r = aleatorio(semente);
  const pingos = Array.from({ length: 5 }, () => ({ ang: r() * Math.PI * 2, comp: 0.06 + r() * 0.1 }));
  deformar(geo, (x, y, z) => {
    const d = Math.hypot(x, z);
    const t = Math.max(0, d - 0.95);
    const a = Math.atan2(z, x) + giro;
    const pingo = pingos.reduce((soma, p) => soma + Math.exp(-((DIFERENCA(a, p.ang) / 0.13) ** 2)) * p.comp, 0);
    const queda = Math.min(0.22, t * 0.8 + t * t * 1.4) + pingo * Math.min(1, t * 4);
    const k = 1 - 0.22 * Math.min(t, 0.6);
    return [x * k, y - queda + 0.004 * fbm(x * 3, z * 3, semente), z * k];
  });
  const malha = new THREE.Mesh(geo, materiais().queijo);
  malha.rotation.y = giro;
  return malha;
}

function queijo() {
  const grupo = new THREE.Group();
  const baixo = fatiaQueijo(0.5, 3);
  baixo.position.y = 0.004;
  const cima = fatiaQueijo(0, 7);
  cima.position.y = 0.016;
  grupo.add(baixo, cima);
  return grupo;
}

// Molho espalhado: um disco irregular que escorre um pouco pela borda.
function molho() {
  const disco = new THREE.LatheGeometry(perfil([[0.001, 0.02], [0.82, 0.02], [0.93, 0.012], [0.95, 0.0], [0.9, 0.03], [0.001, 0.034]], 16), 120);
  deformar(disco, (x, y, z) => {
    const a = Math.atan2(z, x);
    const f = 1 + 0.07 * fbm(Math.cos(a) * 2.5, Math.sin(a) * 2.5, 3);
    const escorrer = Math.hypot(x, z) > 0.85 ? -0.05 * Math.max(0, fbm(Math.cos(a) * 6, Math.sin(a) * 6, 9)) : 0;
    return [x * f, y + escorrer, z * f];
  });
  return new THREE.Mesh(disco, materiais().molho);
}

// Cebola caramelizada: fios curtos e grossos, embolados perto do centro.
function cebola() {
  const m = materiais();
  const r = aleatorio(37);
  const fio = () => {
    const inicio = new THREE.Vector3((r() - 0.5) * 1.5, 0.025 + r() * 0.025, (r() - 0.5) * 1.5).clampLength(0, 0.8);
    const giro = r() * Math.PI * 2;
    const pontos = Array.from({ length: 4 }, (_, i) => inicio.clone().add(new THREE.Vector3(
      Math.cos(giro + i * 0.9) * 0.1 * i, r() * 0.03, Math.sin(giro + i * 0.9) * 0.1 * i
    )));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pontos), 16, 0.034, 7, false);
  };
  const claros = mergeGeometries(Array.from({ length: 20 }, fio));
  const escuros = mergeGeometries(Array.from({ length: 14 }, fio));
  const grupo = new THREE.Group();
  grupo.add(new THREE.Mesh(claros, m.cebolaClara), new THREE.Mesh(escuros, m.cebolaEscura));
  return grupo;
}

function alface() {
  const geo = new THREE.RingGeometry(0.02, 1.16, 180, 8).rotateX(-Math.PI / 2);
  const centro = new THREE.Color('#4a9530');
  const borda = new THREE.Color('#9fd86a');
  colorir(geo, (x, y, z, c) => c.copy(centro).lerp(borda, suave(Math.min(1, Math.hypot(x, z) / 1.16))));
  deformar(geo, (x, y, z) => {
    const d = Math.hypot(x, z) / 1.16;
    const a = Math.atan2(z, x);
    const onda = Math.sin(a * 15 + 3 * fbm(x * 2, z * 2, 1)) * 0.05 * d * d;
    const f = 1 + 0.05 * Math.sin(a * 7) * d * d;
    return [x * f, 0.03 + onda + 0.02 * fbm(x * 3, z * 3, 4), z * f];
  });
  return new THREE.Mesh(geo, materiais().alface);
}

function fatias(raio, altura, quantidade, materiaisFatia, semente, distancia) {
  const r = aleatorio(semente);
  const grupo = new THREE.Group();
  const geo = new THREE.CylinderGeometry(raio, raio, altura, 48);
  for (let i = 0; i < quantidade; i += 1) {
    const malha = new THREE.Mesh(geo, materiaisFatia);
    const ang = (i / quantidade) * Math.PI * 2 + r() * 0.4;
    const dist = i === 0 && quantidade > 4 ? 0 : distancia;
    malha.position.set(Math.cos(ang) * dist, altura / 2 + r() * 0.01, Math.sin(ang) * dist);
    malha.rotation.set((r() - 0.5) * 0.1, r() * Math.PI, (r() - 0.5) * 0.1);
    grupo.add(malha);
  }
  return grupo;
}

const tomate = () => {
  const m = materiais();
  return fatias(0.46, 0.07, 3, [m.tomateLado, m.tomateTampa, m.tomateTampa], 41, 0.5);
};

const picles = () => {
  const m = materiais();
  return fatias(0.21, 0.03, 6, [m.piclesLado, m.piclesTampa, m.piclesTampa], 43, 0.62);
};

function bacon() {
  const grupo = new THREE.Group();
  [[-0.2, 0.25, 0], [0.22, -0.3, 2]].forEach(([z, giro, fase]) => {
    const geo = new THREE.PlaneGeometry(2.1, 0.32, 90, 4).rotateX(-Math.PI / 2);
    deformar(geo, (x, y, zz) => [x, 0.035 + Math.sin(x * 7 + fase) * 0.035 + 0.012 * fbm(x * 5, zz * 5, fase), zz + Math.sin(x * 2.4 + fase) * 0.06]);
    const tira = new THREE.Mesh(geo, materiais().bacon);
    tira.position.z = z;
    tira.rotation.y = giro;
    grupo.add(tira);
  });
  return grupo;
}

// altura: quanto a camada ocupa na pilha; raio: até onde vai, para o rótulo.
const CAMADAS = Object.freeze({
  'pao-topo': { criar: paoTopo, altura: 0.74, raio: 1.08 },
  molho: { criar: molho, altura: 0.03, raio: 1.04 },
  alface: { criar: alface, altura: 0.06, raio: 1.2 },
  tomate: { criar: tomate, altura: 0.07, raio: 1.0 },
  cebola: { criar: cebola, altura: 0.06, raio: 1.0 },
  bacon: { criar: bacon, altura: 0.07, raio: 1.1 },
  picles: { criar: picles, altura: 0.03, raio: 0.85 },
  queijo: { criar: queijo, altura: 0.025, raio: 1.25 },
  carne: { criar: carne, altura: 0.26, raio: 1.1 },
  'pao-base': { criar: paoBase, altura: 0.34, raio: 1.05 }
});

/*
 * Recebe as camadas de cima para baixo (a ordem do config.js). userData.camadas segue a
 * mesma ordem; cada item é um pivô com base, altura e raio, que a coreografia desloca.
 */
export function criarHamburguer(nomes) {
  const grupo = new THREE.Group();
  const deBaixo = [...nomes].reverse();
  const pivos = deBaixo.reduce((lista, nome, i) => {
    const def = CAMADAS[nome];
    if (!def) throw new Error(`Camada de hambúrguer desconhecida: "${nome}"`);
    const base = i === 0 ? 0 : lista[i - 1].userData.base + lista[i - 1].userData.altura;
    const pivo = new THREE.Group();
    pivo.add(def.criar());
    pivo.position.y = base;
    pivo.userData = { nome, base, altura: def.altura, raio: def.raio, ordem: i };
    return [...lista, pivo];
  }, []);
  pivos.forEach((p) => grupo.add(p));
  grupo.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  const ultimo = pivos[pivos.length - 1].userData;
  grupo.userData = { camadas: [...pivos].reverse(), altura: ultimo.base + ultimo.altura };
  return grupo;
}

// abertura 0 = montado, 1 = cada camada afastada "vao" da de baixo (a base fica no lugar).
export function abrirHamburguer(grupo, abertura, vao) {
  grupo.userData.camadas.forEach((pivo) => {
    const { base, ordem } = pivo.userData;
    pivo.position.y = base + ordem * vao * abertura;
  });
}

// Altura total com a pilha aberta, para a coreografia manter o conjunto centralizado.
export const alturaAberta = (grupo, abertura, vao) =>
  grupo.userData.altura + (grupo.userData.camadas.length - 1) * vao * abertura;
