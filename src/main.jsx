import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Siden er forudrenderet ved build (scripts/prerender.mjs), så indholdet
// står i HTML'en, før JavaScript er hentet. Findes det ikke, fx i dev,
// renderes siden i stedet på klienten.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
