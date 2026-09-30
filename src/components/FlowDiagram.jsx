/**
 * DIAGRAM: ET FORLØB I TRIN
 *
 * En kort kæde af trin, der forklarer, hvordan noget hænger sammen. Vandret
 * på bred skærm (med en tynd streg mellem trinene), lodret på telefon.
 * Illustration med opdigtet eksempel og mærket som eksempel: ingen tal, ingen
 * forventning til resultater. Trinene læses som en nummereret liste.
 */
export default function FlowDiagram({ flow }) {
  return (
    <figure>
      <div className="backdrop">
        <ol className="relative grid grid-cols-1 gap-5 rounded-[14px] bg-surface p-4 md:grid-cols-4 md:gap-4 md:p-6">
          {flow.steps.map((step, i) => (
            <li key={step.title} className="relative flex gap-4 md:block">
              <span
                aria-hidden="true"
                className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[14px] font-medium text-paper"
              >
                {i + 1}
              </span>
              {i < flow.steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-9 bottom-[-20px] left-[17px] w-px bg-rule md:top-[17px] md:right-[-16px] md:bottom-auto md:left-9 md:h-px md:w-auto"
                />
              )}
              <div className="md:mt-4">
                <p className="text-[16px] leading-snug font-medium">{step.title}</p>
                <p className="t-body mt-1 text-[14px] leading-snug">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <figcaption className="mt-4">
        <p className="t-eyebrow">{flow.label}</p>
        <p className="t-body mt-2 max-w-[56ch] text-[13px]">{flow.note}</p>
      </figcaption>
    </figure>
  )
}
