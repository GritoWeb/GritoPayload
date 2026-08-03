import React from 'react'

type Stat = {
  value: string
  label: string
}

type StatsBandProps = {
  stats: Stat[]
  showDecoration?: boolean
}

export function StatsBand({ stats, showDecoration = true }: StatsBandProps) {
  return (
    <section aria-label="Estatísticas" className="relative bg-blue px-5 section-y overflow-hidden">
      <div className="container">
        {/* A grid on small screens, not a wrapping flex row: how many items fit per
            line depended on how wide the text rendered, so the fallback font laid
            them out in three rows and Lato in two. Columns keep the row count fixed
            whatever the font does. Wide screens keep the original single-row flex. */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:flex lg:flex-wrap lg:justify-between lg:gap-5">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 text-center md:text-left">
              <span className="font-display font-black text-4xl text-white leading-none">
                {stat.value}
              </span>
              <span className="font-body text-sm text-white/70">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
