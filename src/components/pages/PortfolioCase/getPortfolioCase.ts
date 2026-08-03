import { cache } from 'react'
import { draftMode } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { Portfolio, Media, PortfolioTag } from '@/payload-types'
import type { GalleryItem } from '@/components/ui/Gallery'
import type { PortfolioItem } from '@/blocks/PortfolioListing/PortfolioListingClient'
import { CACHE_TAGS, CACHE_TTL } from '@/lib/cacheTags'
import type { PortfolioLocale } from './strings'

const fetchPortfolioBySlug = async ({
  slug,
  locale,
  draft,
}: {
  slug: string
  locale: PortfolioLocale
  draft: boolean
}) => {
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
}

// Published case persisted in the data cache (R2), tagged for the Portfolios
// publish hook. Draft/live-preview bypasses the cache.
const cachedPortfolioBySlug = (slug: string, locale: PortfolioLocale) =>
  unstable_cache(
    () => fetchPortfolioBySlug({ slug, locale, draft: false }),
    ['portfolio', slug, locale],
    { tags: [CACHE_TAGS.portfolios], revalidate: CACHE_TTL },
  )()

// Cached raw doc — shared by the page AND its metadata (resolved once per request).
export const queryPortfolioBySlug = cache(
  async ({ slug, locale }: { slug: string; locale: PortfolioLocale }) => {
    const { isEnabled: draft } = await draftMode()
    if (draft) return fetchPortfolioBySlug({ slug, locale, draft: true })
    return cachedPortfolioBySlug(slug, locale)
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
  next: PortfolioItem | null
}

type GalleryBlockItem = {
  image?: number | Media | null
  label?: string | null
  accent?: ('blue' | 'orange') | null
  id?: string | null
}

/**
 * Maps a `caseGallery` block's rows onto the shape the Gallery component wants,
 * dropping any row whose upload was removed.
 */
export const toGalleryItems = (
  items: GalleryBlockItem[] | null | undefined,
  fallbackAlt: string,
): GalleryItem[] =>
  (items ?? [])
    .map((item) => {
      const img = item.image && typeof item.image === 'object' ? (item.image as Media) : null
      if (!img?.url) return null
      return {
        url: img.url,
        alt: img.alt ?? item.label ?? fallbackAlt,
        width: img.width ?? undefined,
        height: img.height ?? undefined,
        accent: (item.accent as 'blue' | 'orange') ?? 'blue',
        label: item.label ?? undefined,
      }
    })
    .filter(Boolean) as GalleryItem[]

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

  return { doc, tag, coverImage, stack, next }
}
