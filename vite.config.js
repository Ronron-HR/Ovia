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
    // Manifestet bruges af scripts/prerender.mjs til at forhåndshente sidens JS.
    manifest: true,
    rollupOptions: {
      output: {
        // React ligger i sin egen, cache-venlige fil frem for i en fil opkaldt efter en komponent.
        manualChunks: (id) => {
          if (id.includes('node_modules')) return 'vendor'
          // Fælles kode (navigation, kontakt, priser, beregnerlogik) i én lille fil i stedet for fem: færre forespørgsler i kæden.
          if (/\/src\/(lib\/|data\/|components\/(layout|ui)\/|content\.demos|pageKeys|routes|Site)/.test(id.replace(/\\/g, '/'))) return 'app'
        },
      },
      input: {
        main: 'index.html',
        privatlivspolitik: 'privatlivspolitik/index.html',
      },
    },
  },
})
