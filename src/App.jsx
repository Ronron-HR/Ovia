import Cases from './components/Cases.jsx'
import Hero from './components/Hero.jsx'
import Kontakt from './components/Kontakt.jsx'
import Om from './components/Om.jsx'
import Ydelser from './components/Ydelser.jsx'

export default function App() {
  return (
    <main>
      <Hero />
      <Ydelser />
      <Cases />
      <Om />
      <Kontakt />
    </main>
  )
}
