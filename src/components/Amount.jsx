/**
 * Beløb i logoets skrift. Tager en færdig pristekst fra pricing.js eller
 * calculator.js (fx en engangspris + en månedspris) og sætter hvert beløb i
 * Instrument Serif; resten af teksten ("+", "nu", "/md") står i sidens skrift.
 * Teksten ændres ikke, kun hvordan den vises, så skærmlæsere læser det samme.
 *
 * Hvert beløb (med "/md") holdes på én linje; en lang pris brydes kun mellem
 * beløbene. "kr." får klassen amount-unit, så store beløb kan sætte enheden
 * i 60 % blæk som "Specs" i logoet (se .amount-lg i index.css).
 */
const AMOUNT = /(\d{1,3}(?:\.\d{3})*) kr\.(\/md)?/g

export default function Amount({ text, className = '' }) {
  const parts = []
  let last = 0
  for (const m of text.matchAll(AMOUNT)) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push(
      <span key={m.index} className="amount">
        <span className="amount-num">
          {m[1]} <span className="amount-unit">kr.</span>
        </span>
        {m[2] && <span className="amount-per">{m[2]}</span>}
      </span>,
    )
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <span className={className}>{parts}</span>
}
