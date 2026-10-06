// Renderizador, câmera, luzes e o laço de quadros. Um único canvas fixo atrás da página.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export function suportaWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

function luzes(cena) {
  const ceu = new THREE.HemisphereLight('#fff3e0', '#2a1a10', 0.25);
  const principal = new THREE.DirectionalLight('#fff0da', 2.6);
  principal.position.set(3.5, 7, 4.5);
  principal.castShadow = true;
  principal.shadow.mapSize.set(2048, 2048);
  Object.assign(principal.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 25 });
  principal.shadow.bias = -0.0004;
  principal.shadow.normalBias = 0.02;
  principal.shadow.radius = 5;
  const preenchimento = new THREE.DirectionalLight('#cfe0ff', 0.7);
  preenchimento.position.set(-5, 2.5, 3);
  const contra = new THREE.DirectionalLight('#ffd2a6', 1.5);
  contra.position.set(-2, 4, -6);
  cena.add(ceu, principal, principal.target, preenchimento, contra);
  return { ceu, principal, preenchimento, contra };
}

export function criarPalco(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const cena = new THREE.Scene();
  const fundo = new THREE.Color('#0b0a09');
  cena.background = fundo;
  cena.fog = new THREE.Fog(fundo.clone(), 10, 28);
  const pmrem = new THREE.PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  cena.environmentIntensity = 0.55;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  const iluminacao = luzes(cena);
  const tarefas = new Set();
  const relogio = new THREE.Timer();
  let rodando = true;

  function ajustar() {
    const largura = window.innerWidth;
    const altura = window.innerHeight;
    renderer.setSize(largura, altura, false);
    camera.aspect = largura / altura;
    camera.fov = camera.aspect < 1 ? 50 : 35;
    camera.updateProjectionMatrix();
  }
  ajustar();
  window.addEventListener('resize', ajustar);

  renderer.setAnimationLoop((instante) => {
    relogio.update(instante);
    const dt = Math.min(relogio.getDelta(), 0.05);
    if (!rodando) return;
    tarefas.forEach((tarefa) => tarefa(dt, relogio.getElapsed()));
    renderer.render(cena, camera);
  });

  return {
    renderer,
    cena,
    camera,
    luzes: iluminacao,
    aoQuadro: (tarefa) => tarefas.add(tarefa),
    rodar: (sim) => { rodando = sim; }
  };
}
