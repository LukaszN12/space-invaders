import { defineConfig, Plugin } from 'vite'

// Removes type="module" and crossorigin from built script tags
// so the game works when opened directly as a file:// URL
function removeModuleType(): Plugin {
  return {
    name: 'remove-module-type',
    enforce: 'post',
    transformIndexHtml(html: string) {
      return html
        .replace(/\s*type="module"\s*/g, ' ')  // bez ES modules
        .replace(/\s*crossorigin\s*/g, ' ')     // bez crossorigin
        .replace(/<script /g, '<script defer '); // defer: czekaj na DOM
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [removeModuleType()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        format: 'iife',
        entryFileNames: 'assets/game.js',
      },
    },
  },
})
