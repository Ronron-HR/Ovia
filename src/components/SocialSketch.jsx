import { socialSketch as s } from '../sketches.js'
import { Phone } from './Shots.jsx'

/**
 * SKITSE: TO SLAGS ANNONCER
 *
 * Meta (Facebook og Instagram) som et opslag i nyhedsstrømmen og TikTok som
 * en lodret video. HTML og CSS med opdigtet indhold og et neutralt udseende:
 * en forklaring af formatet, ikke et skærmbillede af nogens annonce eller
 * kampagne, og ingen rigtige logoer.
 */
function MetaAd() {
  return (
    <div className="flex h-full flex-col bg-white text-ink" aria-hidden="true">
      <div className="flex items-center gap-2 p-3">
        <span className="h-8 w-8 rounded-full bg-paper-2" />
        <div className="leading-tight">
          <p className="text-[13px] font-semibold">{s.meta.brand}</p>
          <p className="text-[11px] text-muted">{s.meta.tag}</p>
        </div>
      </div>
      <p className="px-3 pb-2 text-[12px] leading-snug">{s.meta.text}</p>
      <div className="relative flex-1 bg-[#e8c9a0]">
        <span className="absolute top-[18%] left-[14%] h-[38%] w-[38%] rounded-full bg-[#c98c4b]" />
        <span className="absolute right-[12%] bottom-[16%] h-[30%] w-[30%] rounded-full bg-[#7a4a2a]" />
      </div>
      <div className="flex items-center justify-between bg-paper p-3">
        <span className="text-[11px] text-muted">eksempelcafe.dk</span>
        <span className="rounded-md bg-ink px-3 py-1.5 text-[11px] font-medium text-paper">{s.meta.button}</span>
      </div>
    </div>
  )
}

function TikTokAd() {
  return (
    <div className="relative h-full bg-[#1b1b1f] text-white" aria-hidden="true">
      <span className="absolute top-[14%] left-[16%] h-[34%] w-[46%] rounded-full bg-[#3b7f8f]" />
      <span className="absolute top-[38%] right-[10%] h-[24%] w-[36%] rounded-full bg-[#c98c4b]" />
      <div className="absolute top-[42%] right-3 flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-7 w-7 rounded-full bg-white/25" />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
        <p className="text-[12px] font-semibold">{s.tiktok.brand}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-white/85">
          <span className="mr-1 rounded-sm border border-white/60 px-1 text-[9px] uppercase">{s.tiktok.tag}</span>
          {s.tiktok.text}
        </p>
        <span className="mt-2 inline-block rounded-md bg-white px-3 py-1.5 text-[11px] font-medium text-ink">
          {s.tiktok.button}
        </span>
      </div>
    </div>
  )
}

export default function SocialSketch() {
  const items = [
    { key: 'meta', data: s.meta, Ad: MetaAd },
    { key: 'tiktok', data: s.tiktok, Ad: TikTokAd },
  ]

  return (
    <figure>
      <div className="backdrop">
        <div className="grid grid-cols-2 items-end gap-4 md:gap-8">
          {items.map(({ key, data, Ad }) => (
            <div key={key} className="mx-auto w-full max-w-[220px]">
              <Phone label={`${data.name}: ${data.where}. Illustration med opdigtet annonce.`}>
                <div className="aspect-[9/17] overflow-hidden rounded-[21px]">
                  <Ad />
                </div>
              </Phone>
              <p className="mt-3 text-center">
                <span className="block text-[15px] font-medium">{data.name}</span>
                <span className="block text-[13px] text-muted">{data.where}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-4">
        <p className="t-eyebrow">{s.label}</p>
        <p className="t-body mt-2 max-w-[56ch] text-[13px]">{s.note}</p>
      </figcaption>
    </figure>
  )
}
