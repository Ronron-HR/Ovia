import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // To sider: forsiden og privatlivspolitikken. Politikken er sin egen
  // indgang, så den kan åbnes direkte og deles som link.
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        privatlivspolitik: resolve(import.meta.dirname, 'privatlivspolitik/index.html'),
      },
    },
  },
})
