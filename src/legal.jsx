import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import Privatlivspolitik from './components/Privatlivspolitik.jsx'

const root = document.getElementById('root')
const page = (
  <StrictMode>
    <Privatlivspolitik />
  </StrictMode>
)

if (root.hasChildNodes()) hydrateRoot(root, page)
else createRoot(root).render(page)
