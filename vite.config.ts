import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'openseadragon',
              test: /node_modules[\\/]openseadragon/,
              priority: 20
            },
            {
              name: 'ui-vendor',
              test: /node_modules[\\/](react(-dom)?|scheduler|@base-ui)[\\/]?/,
              priority: 20
            }
          ]
        }
      }
    }
  }
});