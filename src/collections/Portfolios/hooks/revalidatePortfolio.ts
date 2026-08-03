import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import { CACHE_TAGS } from '../../../lib/cacheTags'
import type { Portfolio } from '../../../payload-types'

// One portfolio doc backs both locale case routes:
// /portfolio/<slug> (pt) and /en/portfolio/<slug>.
const pathsForSlug = (slug?: string | null): string[] => [
  `/portfolio/${slug}`,
  `/en/portfolio/${slug}`,
]

export const revalidatePortfolio: CollectionAfterChangeHook<Portfolio> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      for (const path of pathsForSlug(doc.slug)) {
        payload.logger.info(`Revalidating portfolio at path: ${path}`)
        revalidatePath(path)
      }
      revalidateTag('portfolios-sitemap')
      revalidateTag(CACHE_TAGS.portfolios)
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      for (const path of pathsForSlug(previousDoc.slug)) {
        payload.logger.info(`Revalidating old portfolio at path: ${path}`)
        revalidatePath(path)
      }
      revalidateTag('portfolios-sitemap')
      revalidateTag(CACHE_TAGS.portfolios)
    }
  }
  return doc
}

export const revalidatePortfolioDelete: CollectionAfterDeleteHook<Portfolio> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    for (const path of pathsForSlug(doc?.slug)) revalidatePath(path)
    revalidateTag('portfolios-sitemap')
  }
  return doc
}
