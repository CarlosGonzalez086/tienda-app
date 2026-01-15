import { defineConfig } from 'vite';
import ng from '@analogjs/vite-plugin-angular';
import { resolve } from 'path';

export default defineConfig({
  plugins: [ng()],
  server: {
    fs: {
      allow: ['.'],
    },

    open: true,
    middlewareMode: false,

    hmr: true,
  },
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
});
