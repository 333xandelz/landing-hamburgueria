import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// O build sai num único dist/index.html, com JS e CSS embutidos: abre com dois cliques
// (sem servidor) e também funciona em qualquer hospedagem estática ou subpasta.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: { chunkSizeWarningLimit: 1500 }
});
