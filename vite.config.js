import { defineConfig } from 'vite';

// base relativa: o build funciona em qualquer subpasta (GitHub Pages, Netlify, servidor próprio).
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 1200 }
});
