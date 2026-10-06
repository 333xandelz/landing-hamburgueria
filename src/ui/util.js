const MAPA = Object.freeze({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' });

export const escapar = (texto) => String(texto).replace(/[&<>"']/g, (c) => MAPA[c]);

// localStorage pode não existir (aba anônima, prévia): a página funciona sem ele.
export function ler(chave, padrao) {
  try {
    const valor = window.localStorage.getItem(chave);
    return valor ? JSON.parse(valor) : padrao;
  } catch {
    return padrao;
  }
}

export function gravar(chave, valor) {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* sem armazenamento: a sacola vale só para esta visita */
  }
}
