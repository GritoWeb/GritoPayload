import React from 'react'

type LogoCloudProps = {
  eyebrow?: string | null
  title?: React.ReactNode
  titleClassName?: string
  description?: string
  items?: React.ReactNode[]
}

export function LogoCloud({ eyebrow, title, titleClassName = '', description, items }: LogoCloudProps) {
  const titleClasses = ['m-0 text-blue mx-auto', titleClassName].filter(Boolean).join(' ')
  return (
    <section className="px-5 section-y bg-white border-y border-line">
      <div className="container">
        <div className="text-center mb-10">
          {eyebrow && <p className="font-eyebrow m-0 mb-3">{eyebrow}</p>}
          {title && <h2 className={titleClasses}>{title}</h2>}
          {description && <p className="mt-4 font-body text-mute text-base max-w-xl mx-auto">{description}</p>}
        </div>
        {items && items.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6">
            {items}
          </div>
        )}
      </div>
    </section>
  )
}
