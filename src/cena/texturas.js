// Texturas desenhadas em canvas: nenhuma imagem externa, nenhuma licença de terceiro.
import * as THREE from 'three';
import { aleatorio } from './ruido.js';

const FONTE = 'Anton, Impact, "Arial Narrow Bold", sans-serif';

function textura(largura, altura, desenhar, { cor = true, repetir = null } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  desenhar(canvas.getContext('2d'), largura, altura);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = cor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  if (repetir) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repetir[0], repetir[1]);
  }
  return t;
}

function pingos(ctx, l, a, quantidade, semente, cores, raio) {
  const r = aleatorio(semente);
  for (let i = 0; i < quantidade; i += 1) {
    ctx.fillStyle = cores[i % cores.length];
    ctx.globalAlpha = 0.25 + r() * 0.6;
    ctx.beginPath();
    ctx.arc(r() * l, r() * a, raio[0] + r() * (raio[1] - raio[0]), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Relevo granulado em tons de cinza, para bumpMap de pão e carne.
export const relevo = (semente, densidade = 2600) => textura(512, 512, (ctx, l, a) => {
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, l, a);
  pingos(ctx, l, a, densidade, semente, ['#ffffff', '#000000', '#a0a0a0', '#404040'], [1, 5]);
}, { cor: false });

export const carne = () => textura(1024, 1024, (ctx, l, a) => {
  ctx.fillStyle = '#4a2413';
  ctx.fillRect(0, 0, l, a);
  pingos(ctx, l, a, 5200, 3, ['#2a1108', '#6e3519', '#1c0a04', '#8a4826'], [1.5, 7]);
  pingos(ctx, l, a, 500, 9, ['#a35c33'], [1, 3]);
});

export const madeira = () => textura(1024, 1024, (ctx, l, a) => {
  const r = aleatorio(21);
  const tabua = a / 6;
  for (let i = 0; i < 6; i += 1) {
    const tom = 26 + Math.floor(r() * 14);
    ctx.fillStyle = `rgb(${tom + 16}, ${tom + 2}, ${tom - 8})`;
    ctx.fillRect(0, i * tabua, l, tabua);
    for (let k = 0; k < 70; k += 1) {
      ctx.strokeStyle = `rgba(${r() < 0.5 ? '0,0,0' : '120,80,55'}, ${0.05 + r() * 0.12})`;
      ctx.lineWidth = 1 + r() * 2.5;
      const y = i * tabua + r() * tabua;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(l * 0.3, y + (r() - 0.5) * 18, l * 0.7, y + (r() - 0.5) * 18, l, y);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.fillRect(0, i * tabua, l, 3);
  }
}, { repetir: [7, 7] });

export const inox = () => textura(1024, 1024, (ctx, l, a) => {
  ctx.fillStyle = '#8c8f94';
  ctx.fillRect(0, 0, l, a);
  const r = aleatorio(33);
  for (let i = 0; i < 2400; i += 1) {
    const claro = r() < 0.5;
    ctx.strokeStyle = claro ? `rgba(255,255,255,${0.04 + r() * 0.1})` : `rgba(0,0,0,${0.04 + r() * 0.1})`;
    ctx.lineWidth = 0.6 + r() * 1.4;
    const y = r() * a;
    const x = r() * l;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 40 + r() * 220, y);
    ctx.stroke();
  }
}, { repetir: [9, 9] });

// Papel manteiga: retângulo com as bordas laterais serrilhadas (branco = papel).
export const alfaPapel = () => textura(1024, 768, (ctx, l, a) => {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, l, a);
  ctx.fillStyle = '#fff';
  const dentes = 26;
  const m = 26;
  ctx.beginPath();
  ctx.moveTo(m, m);
  for (let i = 0; i <= dentes; i += 1) ctx.lineTo(m + ((l - 2 * m) * i) / dentes, i % 2 ? m - 14 : m);
  for (let i = 0; i <= dentes; i += 1) ctx.lineTo(l - m - ((l - 2 * m) * i) / dentes, i % 2 ? a - m + 14 : a - m);
  ctx.closePath();
  ctx.fill();
}, { cor: false });

export const papel = () => textura(512, 512, (ctx, l, a) => {
  ctx.fillStyle = '#f3efe7';
  ctx.fillRect(0, 0, l, a);
  pingos(ctx, l, a, 900, 41, ['#e4ddd1', '#ffffff'], [2, 9]);
});

export const alfaQueijo = () => textura(512, 512, (ctx, l, a) => {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, l, a);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.roundRect(10, 10, l - 20, a - 20, 70);
  ctx.fill();
}, { cor: false });

export const bacon = () => textura(1024, 128, (ctx, l, a) => {
  const faixas = [['#7d2416', 0, 0.22], ['#f0b49b', 0.22, 0.34], ['#a63626', 0.34, 0.62], ['#f2c2ac', 0.62, 0.72], ['#8e2b1c', 0.72, 1]];
  faixas.forEach(([cor, de, ate]) => {
    ctx.fillStyle = cor;
    ctx.fillRect(0, de * a, l, (ate - de) * a);
  });
  pingos(ctx, l, a, 600, 51, ['#5a160c', '#c95a43'], [1, 4]);
});

export const tomate = () => textura(512, 512, (ctx, l, a) => {
  const c = l / 2;
  ctx.fillStyle = '#c92a1f';
  ctx.fillRect(0, 0, l, a);
  ctx.fillStyle = '#e8503b';
  ctx.beginPath();
  ctx.arc(c, c, c * 0.86, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 5; i += 1) {
    const ang = (i / 5) * Math.PI * 2;
    ctx.fillStyle = '#f57b62';
    ctx.beginPath();
    ctx.ellipse(c + Math.cos(ang) * c * 0.48, c + Math.sin(ang) * c * 0.48, c * 0.24, c * 0.15, ang, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd9a8';
    for (let k = 0; k < 6; k += 1) {
      ctx.beginPath();
      ctx.ellipse(c + Math.cos(ang) * c * (0.4 + k * 0.03), c + Math.sin(ang) * c * (0.4 + k * 0.03), 6, 3.5, ang, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = '#d63a2b';
  ctx.beginPath();
  ctx.arc(c, c, c * 0.18, 0, Math.PI * 2);
  ctx.fill();
});

export const picles = () => textura(256, 256, (ctx, l) => {
  const c = l / 2;
  [['#4f7a24', 1], ['#9cc45a', 0.84], ['#c8de8c', 0.6], ['#b2d071', 0.3]].forEach(([cor, raio]) => {
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(c, c, c * raio, 0, Math.PI * 2);
    ctx.fill();
  });
  pingos(ctx, l, l, 40, 61, ['#eef6d2'], [2, 4]);
});

export const listras = (cor = '#d62828', fundo = '#ffffff', faixas = 10) => textura(64, 512, (ctx, l, a) => {
  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, l, a);
  ctx.fillStyle = cor;
  for (let i = 0; i < faixas; i += 2) ctx.fillRect(0, (i * a) / faixas, l, a / faixas);
});

export const xadrez = () => textura(256, 256, (ctx, l) => {
  const q = l / 8;
  for (let i = 0; i < 8; i += 1) {
    for (let j = 0; j < 8; j += 1) {
      ctx.fillStyle = (i + j) % 2 ? '#ffffff' : '#d62828';
      ctx.fillRect(i * q, j * q, q, q);
    }
  }
}, { repetir: [2, 1] });

export function desenharLogo(ctx, cx, cy, r) {
  ctx.save();
  ctx.fillStyle = '#d62828';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = r * 0.07;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.84, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.84); ctx.lineTo(cx, cy + r * 0.84);
  ctx.moveTo(cx - r * 0.84, cy); ctx.lineTo(cx + r * 0.84, cy);
  ctx.moveTo(cx - r * 0.6, cy - r * 0.6);
  ctx.bezierCurveTo(cx - r * 0.25, cy - r * 0.2, cx - r * 0.25, cy + r * 0.2, cx - r * 0.6, cy + r * 0.6);
  ctx.moveTo(cx + r * 0.6, cy - r * 0.6);
  ctx.bezierCurveTo(cx + r * 0.25, cy - r * 0.2, cx + r * 0.25, cy + r * 0.2, cx + r * 0.6, cy + r * 0.6);
  ctx.stroke();
  ctx.fillStyle = '#d62828';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const raio = i % 2 === 0 ? r * 0.26 : r * 0.11;
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    ctx.lineTo(cx + raio * Math.cos(ang), cy + raio * Math.sin(ang));
  }
  ctx.fill();
  ctx.restore();
}

// Nome da marca: a linha 1 é encolhida para caber na largura disponível.
function desenharMarca(ctx, marca, cx, y, largura, tamanho) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#f4f1ec';
  ctx.font = `${tamanho}px ${FONTE}`;
  const medida = ctx.measureText(marca.caixaLinha1).width;
  ctx.save();
  ctx.translate(cx, y);
  ctx.scale(Math.min(1, largura / medida), 1);
  ctx.fillText(marca.caixaLinha1, 0, 0);
  ctx.restore();
  ctx.fillStyle = '#d62828';
  ctx.font = `${Math.round(tamanho * 0.38)}px ${FONTE}`;
  ctx.fillText(marca.caixaLinha2, cx, y + tamanho * 0.5);
  ctx.fillRect(cx - largura / 2, y + tamanho * 0.36, largura / 2 - tamanho * 0.85, tamanho * 0.05);
  ctx.fillRect(cx + tamanho * 0.85, y + tamanho * 0.36, largura / 2 - tamanho * 0.85, tamanho * 0.05);
}

function desenharSlogan(ctx, marca, cx, y, largura, tamanho) {
  ctx.fillStyle = '#d62828';
  ctx.font = `${tamanho}px ${FONTE}`;
  ctx.textAlign = 'center';
  ctx.fillText(marca.slogan.split('').join(String.fromCharCode(8202)), cx, y);
  const meia = ctx.measureText(marca.slogan).width / 2 + tamanho;
  ctx.fillRect(cx - largura / 2, y - tamanho * 0.4, largura / 2 - meia, tamanho * 0.22);
  ctx.fillRect(cx + meia, y - tamanho * 0.4, largura / 2 - meia, tamanho * 0.22);
}

function fundoCaixa(ctx, l, a) {
  const g = ctx.createLinearGradient(0, 0, 0, a);
  g.addColorStop(0, '#1d1d1d');
  g.addColorStop(1, '#0b0b0b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, l, a);
  pingos(ctx, l, a, 1400, 71, ['#262626', '#060606'], [1, 3]);
}

// Lateral da caixa (frente, ou o lado de dentro da tampa quando aberta).
export const caixaLateral = (marca) => textura(2048, 666, (ctx, l, a) => {
  fundoCaixa(ctx, l, a);
  desenharLogo(ctx, a * 0.62, a * 0.5, a * 0.3);
  desenharMarca(ctx, marca, l * 0.6, a * 0.52, l * 0.56, a * 0.3);
  desenharSlogan(ctx, marca, l * 0.6, a * 0.84, l * 0.56, a * 0.07);
});

export const caixaTopo = (marca) => textura(2048, 1024, (ctx, l, a) => {
  fundoCaixa(ctx, l, a);
  ctx.fillStyle = '#d62828';
  ctx.beginPath();
  ctx.ellipse(l / 2, a * 0.2, l * 0.09, a * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  desenharLogo(ctx, l * 0.24, a * 0.58, a * 0.2);
  desenharMarca(ctx, marca, l * 0.6, a * 0.62, l * 0.5, a * 0.2);
  desenharSlogan(ctx, marca, l * 0.6, a * 0.84, l * 0.5, a * 0.045);
});

export const caixaLiso = () => textura(256, 256, fundoCaixa);

export const faixaFritas = () => textura(512, 512, (ctx, l, a) => {
  ctx.fillStyle = '#d62828';
  ctx.fillRect(0, 0, l, a);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, a * 0.42, l, a * 0.2);
  ctx.fillStyle = '#a71c1c';
  ctx.fillRect(0, 0, l, a * 0.07);
  for (let i = 0; i < 4; i += 1) {
    const cx = (l / 4) * (i + 0.5);
    ctx.fillStyle = '#d62828';
    ctx.beginPath();
    for (let k = 0; k < 10; k += 1) {
      const raio = k % 2 === 0 ? a * 0.07 : a * 0.03;
      const ang = (Math.PI / 5) * k - Math.PI / 2;
      ctx.lineTo(cx + raio * Math.cos(ang), a * 0.52 + raio * Math.sin(ang));
    }
    ctx.fill();
  }
});

export const logoCopo = () => textura(512, 512, (ctx, l) => {
  ctx.clearRect(0, 0, l, l);
  desenharLogo(ctx, l / 2, l / 2, l * 0.42);
});

export const conteudoShake = (cor, calda) => textura(512, 512, (ctx, l, a) => {
  ctx.fillStyle = cor;
  ctx.fillRect(0, 0, l, a);
  const r = aleatorio(81);
  ctx.fillStyle = calda;
  for (let i = 0; i < 9; i += 1) {
    const x = (l / 9) * i + r() * 20;
    const fim = a * (0.35 + r() * 0.5);
    ctx.beginPath();
    ctx.moveTo(x - 14, 0);
    ctx.bezierCurveTo(x - 10, fim * 0.5, x + 10 * (r() - 0.5), fim * 0.8, x, fim);
    ctx.arc(x, fim, 9, 0, Math.PI);
    ctx.bezierCurveTo(x + 12, fim * 0.8, x + 16, fim * 0.4, x + 16, 0);
    ctx.fill();
  }
  ctx.fillRect(0, 0, l, a * 0.06);
});

export const copoRefri = () => textura(1024, 512, (ctx, l, a) => {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, l, a);
  ctx.fillStyle = '#d62828';
  for (let i = 0; i < 8; i += 2) ctx.fillRect((l / 8) * i, 0, l / 8, a);
  desenharLogo(ctx, l * 0.25, a * 0.5, a * 0.26);
  desenharLogo(ctx, l * 0.75, a * 0.5, a * 0.26);
});
