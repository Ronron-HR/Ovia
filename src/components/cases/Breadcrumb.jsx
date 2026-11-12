/**
 * Synlig brødkrumme (samme stier som BreadcrumbList i de strukturerede data, src/data/seo.js).
 * items: [[navn, sti], ...]; det sidste led er den aktuelle side og er ikke et link.
 */
export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Brødkrumme" className="text-[15px]">
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-2 p-0">
        {items.map(([name, href], i) => {
          const last = i === items.length - 1
          return (
            <li key={name} className="flex items-center gap-2">
              {last ? <span aria-current="page">{name}</span> : <a href={href} className="flex min-h-12 items-center">{name}</a>}
              {!last && <span aria-hidden="true">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
