import React from 'react'

type AboutSplitProps = {
  media?: React.ReactNode
  children: React.ReactNode
}

export function AboutSplit({ media, children }: AboutSplitProps) {
  return (
    <section className="px-5 section-y">
      <div className="container flex flex-col lg:flex-row items-center gap-14">
        {media && (
          <div className="shrink-0 w-full lg:w-auto flex justify-center">
            {media}
          </div>
        )}
        <div className="flex flex-col gap-4 flex-1">
          {children}
        </div>
      </div>
    </section>
  )
}
