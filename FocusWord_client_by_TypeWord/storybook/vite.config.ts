import { defineConfig } from 'vite';
import path from 'path';
console.log('Resolved src path:', path.resolve(__dirname, 'src'));
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
