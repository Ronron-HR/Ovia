import { useId, useState } from 'react'
import { bookingDemo as d } from '../content.js'

/**
 * EKSEMPEL PÅ BOOKINGFLOW
 *
 * Et lille, ærligt eksempel: kunden vælger behandling, dag og tidspunkt, og
 * oversigten opdaterer sig. Det illustrerer, hvordan et flow kan føles på en
 * hjemmeside. Det er IKKE et aktivt bookingsystem:
 *
 *   - ingen personoplysninger, ingen indsendelse, ingen bekræftelse
 *   - tiderne er opdigtede, og der er ingen priser
 *   - oversigten siger selv, at der ikke er reserveret noget
 *
 * Valgene er radioknapper, så piletaster, fokus og skærmlæsere virker uden
 * ekstra kode. Optagede tider er deaktiverede. En behandling på 45 minutter
 * fylder to felter og kan derfor ikke lægges oven i en optaget tid.
 * Bevægelsen (fladen skifter, tidslisten skifter ind) ligger i motion.css.
 */

const SLOT = 30

function isFree(day, time, minutes) {
  const need = Math.ceil(minutes / SLOT)
  const start = d.times.indexOf(time)
  for (let i = 0; i < need; i += 1) {
    const t = d.times[start + i]
    if (!t || day.busy.includes(t)) return false
  }
  return true
}

function Choice({ name, value, checked, onChange, disabled = false, children, className = '' }) {
  return (
    <label className="block">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        className={`choice flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-rule bg-surface px-3 text-[14px] leading-tight text-ink select-none peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent peer-disabled:cursor-not-allowed peer-disabled:bg-transparent peer-disabled:text-muted/60 peer-disabled:line-through ${className}`}
      >
        {children}
      </span>
    </label>
  )
}

export default function BookingDemo() {
  const uid = useId()
  const [serviceId, setServiceId] = useState('klip')
  const [dayId, setDayId] = useState('tor')
  const [picked, setPicked] = useState(null)

  const service = d.services.find((s) => s.id === serviceId)
  const day = d.days.find((x) => x.id === dayId)

  // Et valgt tidspunkt, der ikke længere kan bruges (fx efter skift til en
  // længere behandling), tæller ikke med.
  const time = picked && isFree(day, picked, service.minutes) ? picked : null

  return (
    <figure className="browser" aria-label={d.label}>
      <div className="browser-bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span className="browser-url">{d.site}</span>
      </div>

      <div className="bg-surface p-5 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="tag">{d.label}</span>
          <span className="t-eyebrow">{d.site}</span>
        </div>

        <fieldset className="mt-7">
          <legend className="t-display mb-3 text-[19px]">
            <span className="t-eyebrow mr-2 align-middle">1</span>
            {d.step1}
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {d.services.map((s) => (
              <Choice
                key={s.id}
                name={`${uid}-service`}
                value={s.id}
                checked={serviceId === s.id}
                onChange={() => setServiceId(s.id)}
                className="flex-col gap-0.5 py-2"
              >
                <span className="font-medium">{s.name}</span>
                <span className="font-mono text-[12px] opacity-70">
                  {s.minutes} {d.summary.minutes}
                </span>
              </Choice>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-8">
          <legend className="t-display mb-3 text-[19px]">
            <span className="t-eyebrow mr-2 align-middle">2</span>
            {d.step2}
          </legend>

          <div className="grid grid-cols-5 gap-2">
            {d.days.map((x) => (
              <Choice
                key={x.id}
                name={`${uid}-day`}
                value={x.id}
                checked={dayId === x.id}
                onChange={() => setDayId(x.id)}
              >
                <span aria-hidden="true">{x.short}</span>
                <span className="sr-only">{x.long}</span>
              </Choice>
            ))}
          </div>

          {/* key: listen skifter ind, hver gang behandling eller dag skifter. */}
          <div
            key={`${serviceId}-${dayId}`}
            className="swap-in mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4"
          >
            {d.times.map((t) => {
              const free = isFree(day, t, service.minutes)
              return (
                <Choice
                  key={t}
                  name={`${uid}-time`}
                  value={t}
                  checked={time === t}
                  disabled={!free}
                  onChange={() => setPicked(t)}
                  className="slot-btn font-mono text-[13px]"
                >
                  {t}
                  {!free && <span className="sr-only"> ({d.summary.busy})</span>}
                </Choice>
              )
            })}
          </div>
          <p className="t-body mt-3 text-[13px]">{d.summary.hint}</p>
        </fieldset>

        <div className="mt-7 rounded-lg bg-paper p-4 md:p-5" aria-live="polite">
          <p className="t-eyebrow">{d.summary.title}</p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-[15px]">
            <dt className="text-muted">{d.summary.treatment}</dt>
            <dd key={serviceId} className="swap-in font-medium">
              {service.name}, {service.minutes} {d.summary.minutes}
            </dd>
            <dt className="text-muted">{d.summary.when}</dt>
            <dd key={`${dayId}-${time}`} className="swap-in font-medium">
              {time ? `${day.long}, kl. ${time}` : d.summary.empty}
            </dd>
          </dl>
        </div>

        <p className="t-body mt-4 text-[13px]">{d.summary.note}</p>
      </div>
    </figure>
  )
}
