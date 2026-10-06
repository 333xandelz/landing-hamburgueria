// Fotos do cardápio renderizadas dos mesmos modelos 3D, num renderizador à parte que é
// descartado no fim (o canvas principal continua livre para a coreografia).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { criarHamburguer } from './hamburguer.js';
import { criarFritas, criarBatataRecheada, criarMilkshake, criarRefrigerante } from './acompanhamentos.js';
import { criarPapel } from './cenario.js';

const PADRAO = ['pao-topo', 'molho', 'cebola', 'queijo', 'carne', 'pao-base'];

function colocar(objeto, x, y, z, escala = 1, giro = 0) {
  objeto.position.set(x, y, z);
  objeto.scale.setScalar(escala);
  objeto.rotation.y = giro;
  return objeto;
}

// Cada tipo devolve o grupo inteiro e o "foco", que define o enquadramento.
const MONTAGENS = Object.freeze({
  hamburguer: (il) => {
    const foco = criarHamburguer(il.camadas && il.camadas.length ? il.camadas : PADRAO);
    const papel = criarPapel();
    papel.scale.setScalar(0.85);
    const grupo = new THREE.Group();
    grupo.add(papel, colocar(foco, 0, 0.01, 0, 1, 0.5));
    return { grupo, foco };
  },
  combo: () => {
    const tabua = new THREE.Mesh(
      new RoundedBoxGeometry(4.4, 0.16, 2.2, 3, 0.05),
      new THREE.MeshStandardMaterial({ color: '#7a4b2a', roughness: 0.6 })
    );
    tabua.position.y = 0.08;
    tabua.receiveShadow = true;
    const grupo = new THREE.Group();
    grupo.add(
      tabua,
      colocar(criarFritas(), -1.45, 0.16, -0.3, 0.95, 0.4),
      colocar(criarRefrigerante(), 1.5, 0.16, -0.35, 1.05),
      colocar(criarHamburguer(PADRAO), 0, 0.16, 0.25, 0.85, 0.6)
    );
    return { grupo, foco: grupo };
  },
  fritas: () => {
    const foco = colocar(criarFritas(), 0, 0, 0, 1, 0.35);
    return { grupo: foco, foco };
  },
  'batata-recheada': () => {
    const foco = colocar(criarBatataRecheada(), 0, 0, 0, 1, 0.2);
    return { grupo: foco, foco };
  },
  milkshake: (il) => {
    const foco = criarMilkshake(il.sabor);
    return { grupo: foco, foco };
  }
});

function enquadrar(camera, foco) {
  const caixa = new THREE.Box3().setFromObject(foco);
  const centro = caixa.getCenter(new THREE.Vector3());
  const tamanho = caixa.getSize(new THREE.Vector3());
  const vertical = Math.max(tamanho.y, tamanho.x / camera.aspect) * 1.18;
  const distancia = vertical / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  camera.position.set(centro.x, centro.y + distancia * 0.32, centro.z + distancia);
  camera.lookAt(centro.x, centro.y - tamanho.y * 0.04, centro.z);
}

export async function renderizarMiniaturas(itens, aoPronto) {
  const largura = 720;
  const altura = 540;
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(largura, altura, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0x000000, 0);

  const cena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  cena.environmentIntensity = 0.6;
  const luz = new THREE.DirectionalLight('#fff0da', 2.8);
  luz.position.set(3, 7, 5);
  luz.castShadow = true;
  luz.shadow.mapSize.set(1024, 1024);
  Object.assign(luz.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 });
  const contra = new THREE.DirectionalLight('#ffd2a6', 1.6);
  contra.position.set(-3, 4, -5);
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(30, 30).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 0.5 }));
  chao.receiveShadow = true;
  cena.add(luz, contra, new THREE.HemisphereLight('#fff3e0', '#2a1a10', 0.4), chao);
  const camera = new THREE.PerspectiveCamera(28, largura / altura, 0.1, 60);

  for (const [indice, item] of itens.entries()) {
    const montar = MONTAGENS[item.ilustracao.tipo];
    if (!montar) throw new Error(`Ilustração de cardápio desconhecida: "${item.ilustracao.tipo}"`);
    const { grupo, foco } = montar(item.ilustracao);
    cena.add(grupo);
    enquadrar(camera, foco);
    renderer.render(cena, camera);
    aoPronto(indice, canvas.toDataURL('image/png'));
    cena.remove(grupo);
    await new Promise((proximo) => setTimeout(proximo, 0));
  }
  pmrem.dispose();
  renderer.dispose();
  renderer.forceContextLoss();
}
