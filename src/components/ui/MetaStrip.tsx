import React from 'react'

export type MetaItem = {
  label: string
  value: string
  small?: boolean
}

// Dense "facts rail": one row of equal columns on desktop (any count),
// stacked with hairlines on mobile. Card background, thin dividers.
export function MetaStrip({ items }: { items: MetaItem[] }) {
  return (
    <dl className="m-0 grid grid-cols-1 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card sm:auto-cols-fr sm:grid-flow-col sm:divide-x sm:divide-y-0">
      {items.map((item) => (
        <div key={item.label} className="px-[18px] py-4">
          <dt className="font-body text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-mute">
            {item.label}
          </dt>
          <dd
            className={`m-0 mt-1.5 leading-snug ${
              item.small ? 'text-[0.84rem] font-semibold text-ink-soft' : 'text-[0.95rem] font-bold text-ink'
            }`}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
