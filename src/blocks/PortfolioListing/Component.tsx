import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { PortfolioListingBlock, Portfolio, Media, PortfolioTag } from '@/payload-types'
import type { TitleMaxWidth } from '@/utilities/titleMaxWidthClass'
import { PortfolioListingClient, type PortfolioItem, type FilterOption } from './PortfolioListingClient'

export const PortfolioListingComponent: React.FC<PortfolioListingBlock> = async ({
  eyebrow,
  title,
  titleMaxWidth,
  showFilters,
}) => {
  const payload = await getPayload({ config: configPromise })

  const [portfoliosResult, tagsResult] = await Promise.all([
    payload.find({
      collection: 'portfolios',
      depth: 1,
      limit: 200,
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
        result: true,
      },
    }),
    payload.find({
      collection: 'portfolio-tags',
      depth: 0,
      limit: 100,
      overrideAccess: false,
    }),
  ])

  const portfolios: PortfolioItem[] = (portfoliosResult.docs as Portfolio[]).map((p) => {
    const image = p.image && typeof p.image === 'object' ? (p.image as Media) : null
    const tag = p.tag && typeof p.tag === 'object' ? (p.tag as PortfolioTag) : null

    return {
      id: String(p.id),
      title: p.title,
      slug: p.slug,
      client: p.client ?? null,
      result: p.result ?? null,
      tagId: tag ? String(tag.id) : null,
      tagLabel: tag?.title ?? null,
      tagVariant: (p.tagVariant as 'blue' | 'orange') ?? 'blue',
      accent: (p.accent as 'blue' | 'orange') ?? 'blue',
      image,
    }
  })

  // Only surface tags that have at least one portfolio assigned to them
  const usedTagIds = new Set(portfolios.map((p) => p.tagId).filter(Boolean))

  const filters: FilterOption[] = tagsResult.docs
    .filter((tag) => usedTagIds.has(String(tag.id)))
    .map((tag) => ({
      label: tag.title,
      value: String(tag.id),
      slug: tag.slug,
    }))

  return (
    <PortfolioListingClient
      portfolios={portfolios}
      filters={filters}
      eyebrow={eyebrow}
      title={title}
      titleMaxWidth={titleMaxWidth as TitleMaxWidth | null | undefined}
      showFilters={showFilters ?? true}
    />
  )
}
