import { useEffect, useState } from 'react'

/**
 * Nav-tilstande, der afhænger af scroll — uden scroll-listeners.
 *
 * active   id på det link, man befinder sig i. Altid præcis ét: rækken af
 *          sektioner læses fra DOM'en, og en sektion uden eget link (Sådan
 *          foregår det) hører til det link, man kom fra. Findes der ingen
 *          match endnu, står det første link aktivt — aldrig nul, aldrig to.
 * scrolled sand, når indholdet er begyndt at glide op under baren. Bruges til
 *          at tegne hårstregen. Aflæses på en 1px-vagt øverst i laget frem
 *          for et scroll-tal, så tærsklen følger lagovergangen af sig selv.
 *
 * Aktiv sektion: den, der krydser et smalt bånd ved 40% af skærmhøjden.
 * Båndet ligger lavere end baren, så et link skifter, når sektionen
 * reelt fylder det, man kigger på, og ikke når dens kant lige rammer toppen.
 */
export function useNavSpy(linkIds) {
  const [active, setActive] = useState(linkIds[0])
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sections = [...document.querySelectorAll('main section[id]')]
    if (!sections.length) return

    // Sektion → hvilket link den hører under. Sektioner før det første
    // link (heroen) falder tilbage på det første.
    const ownerOf = new Map()
    let owner = linkIds[0]
    for (const section of sections) {
      if (linkIds.includes(section.id)) owner = section.id
      ownerOf.set(section, owner)
    }

    const inBand = new Set()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target)
          else inBand.delete(entry.target)
        }
        // Flere sektioner i båndet ved en kant: den nederste vinder.
        // Ingen i båndet: intet skifter, så der aldrig er nul aktive.
        const current = sections.filter((s) => inBand.has(s)).pop()
        if (current) setActive(ownerOf.get(current))
      },
      { rootMargin: '-40% 0px -59% 0px' },
    )
    sections.forEach((s) => observer.observe(s))

    return () => observer.disconnect()
  }, [linkIds])

  useEffect(() => {
    const sentinel = document.querySelector('[data-nav-sentinel]')
    if (!sentinel) return

    const observer = new IntersectionObserver(([entry]) => {
      // Ude af billedet OVER skærmen, ikke under: før lagovergangen ligger
      // vagten under skærmen, og der er baren skjult.
      setScrolled(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })
    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [])

  return { active, scrolled }
}
