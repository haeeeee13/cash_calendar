import { defineConfig } from 'vite';

export default defineConfig({
  base: '/cash_calendar/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        variantB: 'variant-b/index.html',
      },
    },
  },
});
