import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import tailwindcss from "@tailwindcss/vite";
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
      vue(),
      legacy(),
      tailwindcss()
  ],
  build: {
    chunkSizeWarningLimit: 1024,

  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }

})
