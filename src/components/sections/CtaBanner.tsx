import React from 'react'

const ctaBannerVariant: Record<string, string> = {
  blue: 'bg-blue text-white',
  orange: 'bg-orange text-white',
  white: 'bg-white text-ink',
}

const ctaBannerText: Record<string, { eyebrow: string; title: string; desc: string }> = {
  blue:   { eyebrow: 'text-white/85',  title: 'text-white', desc: 'text-white/85' },
  orange: { eyebrow: 'text-white/85',  title: 'text-white', desc: 'text-white/85' },
  white:  { eyebrow: 'text-blue',      title: 'text-blue',  desc: 'text-mute'     },
}

export function CtaBanner({
  eyebrow,
  title,
  titleClassName = '',
  description,
  actions,
  media,
  variant = 'blue',
  className = '',
}: {
  eyebrow?: string
  title: React.ReactNode
  titleClassName?: string
  description?: string
  actions?: React.ReactNode
  media?: React.ReactNode
  variant?: 'blue' | 'orange' | 'white'
  className?: string
}) {
  const root = ['px-5 section-y', className].filter(Boolean).join(' ')
  const inner = [
    'relative container rounded-[32px] overflow-hidden',
    'p-10 md:p-14',
    'grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-10 items-center',
    ctaBannerVariant[variant] ?? ctaBannerVariant.blue,
  ]
    .filter(Boolean)
    .join(' ')
  const tx = ctaBannerText[variant] ?? ctaBannerText.blue
  const titleClasses = ['m-0', tx.title, titleClassName].filter(Boolean).join(' ')

  return (
    <section className={root}>
      <div className={inner}>
        <div className="relative z-10">
          {eyebrow && <p className={`font-eyebrow m-0 mb-2.5 ${tx.eyebrow}`}>{eyebrow}</p>}
          {title && <h2 className={titleClasses}>{title}</h2>}
          {description && <p className={`mt-3.5 max-w-[28rem] ${tx.desc}`}>{description}</p>}
          {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
        </div>
        {media && <div className="relative z-10 flex justify-center">{media}</div>}
      </div>
    </section>
  )
}
