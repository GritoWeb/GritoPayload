import React from 'react'

export type TimelineStep = {
  number?: string | null
  title?: string | null
  description?: string | null
  id?: string | null
}

// Vertical timeline: a single orange stroke (70% opacity) that runs down,
// rings each step number and continues — the connector stops at each ring
// instead of crossing behind it.
export function PortfolioTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="relative m-0 mt-8 list-none p-0 pl-[34px]">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        return (
          <li key={step.id ?? step.number ?? index} className={`relative ${isLast ? '' : 'pb-8'}`}>
            {/* connector: below this ring down to the next one */}
            {!isLast && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-[-24.75px] top-6 w-[1.5px] bg-orange/70"
              />
            )}
            {/* ring marker with the step number */}
            <span
              aria-hidden="true"
              className="absolute left-[-34px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] border-orange/70 text-[0.62rem] font-semibold text-orange/70"
            >
              {step.number}
            </span>
            {step.title && <h3 className="m-0 text-xl font-bold text-ink">{step.title}</h3>}
            {step.description && (
              <p className="m-0 mt-1.5 text-[15px] leading-relaxed text-mute">{step.description}</p>
            )}
          </li>
        )
      })}
    </ol>
  )
}
