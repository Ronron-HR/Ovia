import DemoTeasers from '../components/DemoTeasers.jsx'
import Hero from '../components/Hero.jsx'
import { ContactCta } from '../components/Kontakt.jsx'
import Overview from '../components/Overview.jsx'
import Review from '../components/Review.jsx'
import Samarbejde from '../components/Samarbejde.jsx'

/** Forsiden: hero med hele prisberegneren, de fire demoer, overblik, proces, feedback og kontakt. */
export default function Home() {
  return (
    <>
      <Hero />
      <DemoTeasers />
      <Overview />
      <Samarbejde />
      <Review under />
      <ContactCta />
    </>
  )
}
