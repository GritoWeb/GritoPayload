import React from 'react'

export function HeroSection({
  eyebrow,
  title,
  titleClassName = '',
  description,
  actions,
  media,
  trustLine,
  className = '',
}: {
  eyebrow?: string
  title: React.ReactNode
  titleClassName?: string
  description?: string
  actions?: React.ReactNode
  media?: React.ReactNode
  trustLine?: string
  className?: string
}) {
  const hasMedia = !!media
  const root = ['relative px-5 py-16', className].filter(Boolean).join(' ')
  const inner = hasMedia
    ? 'container grid grid-cols-1 md:grid-cols-[1.1fr_1fr] items-center gap-12'
    : 'container'
  const titleClasses = ['m-0 text-blue', titleClassName].filter(Boolean).join(' ')

  return (
    <section className={root}>
      <div className={inner}>
        <div>
          {eyebrow && <p className="font-eyebrow m-0 mb-3">{eyebrow}</p>}
          <h1 className={titleClasses}>{title}</h1>
          {description && <p className="body-text text-mute mt-4 max-w-xl">{description}</p>}
          {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
          {trustLine && <p className="text-xs text-ink-soft mt-7 max-w-xl">{trustLine}</p>}
        </div>
        {hasMedia && (
          <div className="flex justify-center items-center lg:min-h-[420px]">{media}</div>
        )}
      </div>
    </section>
  )
}
