import React from 'react'
import type { SectionServicesBlock } from '@/payload-types'
import { SectionTitle, ServiceGrid } from '@/components/sections'
import { parseTitle } from '@/utilities/parseTitle'
import { titleMaxWidthClass, type TitleMaxWidth } from '@/utilities/titleMaxWidthClass'
import { ServiceCard } from '@/home/cards'

type IconType = 'globe' | 'cart' | 'landing' | 'screen' | 'brand' | 'code'

const ServiceIcon = ({ type }: { type: IconType }) => {
  switch (type) {
    case 'globe':
      return (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
        </svg>
      )
    case 'cart':
      return (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M3 4h2l3 12h11l2-8H6" />
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="18" cy="20" r="1.5" />
        </svg>
      )
    case 'landing':
      return (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18" />
          <path d="M7 13h10" />
          <rect x="7" y="15.5" width="7" height="3" rx="1.5" />
        </svg>
      )
    case 'screen':
      return (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      )
    case 'brand':
      return (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      )
    case 'code':
      return (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
        </svg>
      )
  }
}

export const SectionServicesComponent: React.FC<SectionServicesBlock> = ({
  eyebrow,
  title,
  titleMaxWidth,
  description,
  services,
}) => {
  return (
    <section className="px-5 section-y">
      <div className="container">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
          <SectionTitle
            eyebrow={eyebrow ?? undefined}
            align="left"
            titleClassName={titleMaxWidthClass(titleMaxWidth as TitleMaxWidth | null | undefined)}
          >
            {parseTitle(title)}
          </SectionTitle>
          {description && (
            <p className="max-w-md text-mute body-text m-0">{description}</p>
          )}
        </div>
        <ServiceGrid>
          {(services ?? []).map((service) => (
            <ServiceCard
              key={service.id}
              variant={service.variant as 'blue' | 'orange'}
              icon={<ServiceIcon type={service.iconType as IconType} />}
              title={service.name}
              description={service.description}
              bullets={service.bullets?.map((b) => b.text) ?? undefined}
              ctaLabel={service.ctaLabel ?? undefined}
              href={service.ctaHref ?? '#'}
            />
          ))}
        </ServiceGrid>
      </div>
    </section>
  )
}
