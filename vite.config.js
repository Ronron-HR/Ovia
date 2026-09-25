import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // To sider: forsiden og privatlivspolitikken. Politikken er sin egen
  // indgang, så den kan åbnes direkte og deles som link.
  //
  // Stierne er relative til projektroden og bevidst uden import.meta og
  // node:path: Cloudflares `wrangler deploy` læser denne fil for at
  // opdage projekttypen og kunne ikke parse den version, der brugte dem.
  build: {
    rollupOptions: {
      output: {
        // React ligger i sin egen, cache-venlige fil frem for i en fil opkaldt efter en komponent.
        manualChunks: (id) => (id.includes('node_modules') ? 'vendor' : undefined),
      },
      input: {
        main: 'index.html',
        privatlivspolitik: 'privatlivspolitik/index.html',
      },
    },
  },
})
