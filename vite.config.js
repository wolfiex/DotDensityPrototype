import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 3000,
    fs: {
      allow: ['.']
    }
  },
  build: {
    sourcemap: true
  },
  optimizeDeps: {
    include: ['maplibre-gl', 'carbon-components-svelte']
  }
});
