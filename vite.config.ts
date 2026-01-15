import { defineConfig } from 'vite';
import ng from '@analogjs/vite-plugin-angular';
import { resolve } from 'path';

export default defineConfig({
  plugins: [ng()],
  server: {
    fs: {
      allow: ['.'],
    },
    // Reemplazo correcto de historyApiFallback
    // Se llama "spaFallback" dentro de "server"
    open: true,
    middlewareMode: false,
    // configurando manualmente el fallback
    hmr: true,
  },
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
});
