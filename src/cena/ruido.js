// Aleatoriedade com semente e ruído suave: o mesmo modelo sai igual em toda carga.

export function aleatorio(semente = 1) {
  let estado = semente >>> 0;
  return () => {
    estado = (Math.imul(estado, 1664525) + 1013904223) >>> 0;
    return estado / 4294967296;
  };
}

function hash(x, y, z) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const suave = (t) => t * t * (3 - 2 * t);
const mistura = (a, b, t) => a + (b - a) * t;

// Ruído de valor 3D em [0, 1].
export function ruido(x, y = 0, z = 0) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const u = suave(x - xi);
  const v = suave(y - yi);
  const w = suave(z - zi);
  const canto = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz);
  const x00 = mistura(canto(0, 0, 0), canto(1, 0, 0), u);
  const x10 = mistura(canto(0, 1, 0), canto(1, 1, 0), u);
  const x01 = mistura(canto(0, 0, 1), canto(1, 0, 1), u);
  const x11 = mistura(canto(0, 1, 1), canto(1, 1, 1), u);
  return mistura(mistura(x00, x10, v), mistura(x01, x11, v), w);
}

// Soma de oitavas, em [-1, 1].
export function fbm(x, y = 0, z = 0, oitavas = 3) {
  let total = 0;
  let amplitude = 0.5;
  let frequencia = 1;
  let norma = 0;
  for (let i = 0; i < oitavas; i += 1) {
    total += amplitude * ruido(x * frequencia, y * frequencia, z * frequencia);
    norma += amplitude;
    amplitude *= 0.5;
    frequencia *= 2;
  }
  return (total / norma) * 2 - 1;
}
