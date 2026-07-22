import React from 'react'

export type Stat = {
  value: string
  label: string
}

// Big numbers straight on the paper — no cards. Equal columns split by thin
// hairlines (vertical on desktop, horizontal when stacked on mobile).
export function ResultsGrid({ stats }: { stats: Stat[] }) {
  return (
    <dl className="m-0 grid grid-cols-1 divide-y divide-line border-t border-line md:auto-cols-fr md:grid-flow-col md:divide-x md:divide-y-0">
      {stats.map((stat) => (
        <div key={stat.label} className="pt-6 md:px-[22px] md:first:pl-0">
          <dd className="m-0 font-display text-[clamp(2.6rem,6vw,3.7rem)] font-black leading-none tracking-[-0.02em] tabular-nums text-orange">
            {stat.value}
          </dd>
          <dt className="mt-3 max-w-[22ch] text-[0.92rem] text-mute">{stat.label}</dt>
        </div>
      ))}
    </dl>
  )
}
