import { defineConfig } from 'vite';

export default defineConfig({
  base: '/cash_calendar/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        reactPreview: 'react-preview.html',
      },
    },
  },
});
