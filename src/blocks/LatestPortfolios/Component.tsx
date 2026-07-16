import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { LatestPortfoliosBlock, Portfolio, Media, PortfolioTag } from '@/payload-types'
import { PortfolioCardGrid, type PortfolioItem } from '@/blocks/PortfolioListing/PortfolioListingClient'
import { Button } from '@/components/Button'
import { parseTitle } from '@/utilities/parseTitle'
import { titleMaxWidthClass, type TitleMaxWidth } from '@/utilities/titleMaxWidthClass'
import { ArrowIcon } from '@/components/ui/ArrowIcon'

export const LatestPortfoliosComponent: React.FC<LatestPortfoliosBlock> = async ({
  eyebrow,
  title,
  titleMaxWidth,
  buttonLabel,
  buttonHref,
}) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'portfolios',
    depth: 1,
    limit: 3,
    overrideAccess: false,
    sort: '-publishedAt',
    select: {
      title: true,
      slug: true,
      client: true,
      image: true,
      tag: true,
      tagVariant: true,
      accent: true,
      year: true,
      result: true,
    },
  })

  const portfolios: PortfolioItem[] = (result.docs as Portfolio[]).map((p) => {
    const image = p.image && typeof p.image === 'object' ? (p.image as Media) : null
    const tag = p.tag && typeof p.tag === 'object' ? (p.tag as PortfolioTag) : null

    return {
      id: String(p.id),
      title: p.title,
      slug: p.slug,
      client: p.client ?? null,
      result: p.result ?? null,
      year: p.year ?? null,
      tagId: tag ? String(tag.id) : null,
      tagLabel: tag?.title ?? null,
      tagVariant: (p.tagVariant as 'blue' | 'orange') ?? 'blue',
      accent: (p.accent as 'blue' | 'orange') ?? 'blue',
      image,
    }
  })

  return (
    <section className="px-5 section-y">
      <div className="container">
        <div className="flex items-end  justify-between flex-wrap gap-6 mb-10">
          <header className="flex flex-col gap-3">
            {eyebrow && <p className="font-eyebrow m-0">{eyebrow}</p>}
            {title && (
              <h2
                className={['m-0 text-blue', titleMaxWidthClass(titleMaxWidth as TitleMaxWidth | null | undefined)]
                  .filter(Boolean)
                  .join(' ')}
              >
                {parseTitle(title)}
              </h2>
            )}
          </header>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((item) => (
            <PortfolioCardGrid key={item.id} item={item} />
          ))}
        </div>
        <div className='mt-10'>
          {buttonLabel && (
            <Button variant="blue" href={buttonHref ?? '/portfolio'} icon={<ArrowIcon size={24} />}>
              {buttonLabel}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
