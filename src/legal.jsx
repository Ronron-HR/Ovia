import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Privatlivspolitik from './components/Privatlivspolitik.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Privatlivspolitik />
  </StrictMode>,
)
