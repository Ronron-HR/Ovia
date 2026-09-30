import { useEffect, useState } from 'react'

/**
 * Sand, når indholdet er begyndt at glide op under navigationen. Bruges til
 * at tegne baren og dens hårstreg. Aflæses på en 1px-vagt øverst på siden
 * (data-nav-sentinel) frem for et scroll-tal, så der ikke lyttes til scroll.
 */
export function useScrolled() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sentinel = document.querySelector('[data-nav-sentinel]')
    if (!sentinel) return

    const observer = new IntersectionObserver(([entry]) => {
      // Ude af billedet OVER skærmen, ikke under.
      setScrolled(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })
    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [])

  return scrolled
}
