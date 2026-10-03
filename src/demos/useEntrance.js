import { useEffect } from 'react'

/**
 * INDGANG I KONCEPTERNE — den lette afløser for de gamle scroll-scener.
 *
 * Før (d2d8d3c, 25. sep.): konceptillustrationerne kørte "scroll-scener"
 * (useScene): et scroll-lyt + rAF flyttede billedet inde i rammen og gav
 * rammerne parallax. Slået fra på telefoner i a83d82d (29. sep., "lettere
 * mobil": tungest at tegne) og fjernet sammen med illustrationerne i 62829b9
 * (30. sep.), da koncepterne blev rigtige små sider.
 *
 * Nu: hver blok i koncepternes sektioner glider op og toner frem ÉN gang, når
 * den kommer ind i billedet, og bliver stående. Kun IntersectionObserver og
 * CSS (transform og opacity, demos.css: [data-enter]); ingen scroll-lyt, ingen
 * parallax, intet bibliotek.
 *
 * Sikkerhed: kun blokke, der ligger UNDER skærmen, når siden er klar, skjules
 * (data-enter), så intet i første billede (og intet, man allerede har set)
 * forsvinder, og der er intet at vente på for LCP. Uden JavaScript, uden
 * IntersectionObserver eller med prefers-reduced-motion skjules intet. Blokken
 * fylder sin plads hele tiden (kun transform), så der er ingen layoutforskydning.
 */
const BLOCKS = '.dm-section .dm-wrap > *, .dm-footer-in > *'

export function useEntrance() {
  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const fold = window.innerHeight
    const nodes = [...document.querySelectorAll(BLOCKS)].filter((n) => n.getBoundingClientRect().top > fold)
    if (!nodes.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.dataset.enter = 'in'
          observer.unobserve(entry.target)
        }
      },
      // 15 % synlig: også de sidste blokke nederst på siden når det.
      { threshold: 0.15 },
    )
    // Blokke i samme sektion kommer lidt efter hinanden (højst 3 trin).
    const order = new Map()
    for (const node of nodes) {
      const section = node.closest('.dm-section, .dm-footer') ?? document.body
      const i = order.get(section) ?? 0
      order.set(section, i + 1)
      node.style.setProperty('--enter-d', `${Math.min(i, 3) * 70}ms`)
      node.dataset.enter = ''
      observer.observe(node)
    }
    return () => observer.disconnect()
  }, [])
}
