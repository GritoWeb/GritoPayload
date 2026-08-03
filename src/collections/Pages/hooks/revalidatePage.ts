import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import { CACHE_TAGS } from '../../../lib/cacheTags'
import type { Page } from '../../../payload-types'

// A single page doc backs both locale routes, so revalidate pt AND en.
// pt lives at the root ("/", "/about"); en is prefixed ("/en", "/en/about").
const pathsForSlug = (slug?: string | null): string[] => {
  if (slug === 'home') return ['/', '/en']
  return [`/${slug}`, `/en/${slug}`]
}

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      for (const path of pathsForSlug(doc.slug)) {
        payload.logger.info(`Revalidating page at path: ${path}`)
        revalidatePath(path)
      }
      revalidateTag('pages-sitemap')
      revalidateTag(CACHE_TAGS.pages)
    }

    // Page was unpublished — drop its old cached routes.
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      for (const path of pathsForSlug(previousDoc.slug)) {
        payload.logger.info(`Revalidating old page at path: ${path}`)
        revalidatePath(path)
      }
      revalidateTag('pages-sitemap')
      revalidateTag(CACHE_TAGS.pages)
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    for (const path of pathsForSlug(doc?.slug)) revalidatePath(path)
    revalidateTag('pages-sitemap')
  }

  return doc
}
