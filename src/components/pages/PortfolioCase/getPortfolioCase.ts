import { cache } from 'react'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { Portfolio, Media, PortfolioTag } from '@/payload-types'
import type { GalleryItem } from '@/components/ui/Gallery'
import type { PortfolioItem } from '@/blocks/PortfolioListing/PortfolioListingClient'
import type { PortfolioLocale } from './strings'

// Cached raw doc — shared by the page AND its metadata so we hit D1 only once.
export const queryPortfolioBySlug = cache(
  async ({ slug, locale }: { slug: string; locale: PortfolioLocale }) => {
    const { isEnabled: draft } = await draftMode()
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'portfolios',
      draft,
      limit: 1,
      overrideAccess: draft,
      locale,
      where: { slug: { equals: slug } },
      depth: 2,
    })

    return (result.docs?.[0] as Portfolio | undefined) ?? null
  },
)

// The normalized shape the page renders — pure data, no UI copy. Relations are
// resolved to their objects and the next case is picked here so the component
// only composes.
export type PortfolioCaseView = {
  doc: Portfolio
  tag: PortfolioTag | null
  coverImage: Media | null
  stack: string
  gallery: GalleryItem[]
  next: PortfolioItem | null
}

export async function getPortfolioCase(
  slug: string,
  locale: PortfolioLocale,
): Promise<PortfolioCaseView | null> {
  const doc = await queryPortfolioBySlug({ slug, locale }) // reuses the cache
  if (!doc) return null

  const tag = doc.tag && typeof doc.tag === 'object' ? (doc.tag as PortfolioTag) : null
  const coverImage = doc.image && typeof doc.image === 'object' ? (doc.image as Media) : null

  const stack = (doc.stack ?? [])
    .map((item) => item.tool)
    .filter(Boolean)
    .join(' · ')

  const gallery: GalleryItem[] = (doc.gallery ?? [])
    .map((item) => {
      const img = item.image && typeof item.image === 'object' ? (item.image as Media) : null
      if (!img?.url) return null
      return {
        url: img.url,
        alt: img.alt ?? item.label ?? doc.title,
        width: img.width ?? undefined,
        height: img.height ?? undefined,
        accent: (item.accent as 'blue' | 'orange') ?? 'blue',
        label: item.label ?? undefined,
      }
    })
    .filter(Boolean) as GalleryItem[]

  const relatedPortfolios: PortfolioItem[] = ((doc.relatedPortfolios as Portfolio[]) ?? [])
    .filter((r) => typeof r === 'object')
    .map((r) => {
      const img = r.image && typeof r.image === 'object' ? (r.image as Media) : null
      const rtag = r.tag && typeof r.tag === 'object' ? (r.tag as PortfolioTag) : null
      return {
        id: String(r.id),
        title: r.title,
        slug: r.slug,
        client: r.client ?? null,
        result: r.result ?? null,
        tagId: rtag ? String(rtag.id) : null,
        tagLabel: rtag?.title ?? null,
        tagVariant: (r.tagVariant as 'blue' | 'orange') ?? 'blue',
        accent: (r.accent as 'blue' | 'orange') ?? 'blue',
        image: img,
      }
    })

  const next = relatedPortfolios[0] ?? null

  return { doc, tag, coverImage, stack, gallery, next }
}
