import React from 'react'

export function TestimonialsSection({
  leading,
  children,
  className = '',
}: {
  leading: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const root = ['relative px-6 lg:px-12 section-y', className].filter(Boolean).join(' ')
  return (
    <section className={root}>
      <div className="container grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="self-start">{leading}</div>
        <div className="flex flex-col gap-5 justify-center">{children}</div>
      </div>
    </section>
  )
}
