import { cache } from 'react'
import { draftMode } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { Post, Media, Tag, User } from '@/payload-types'
import type { PostItem } from '@/blocks/BlogListing/BlogListingClient'
import { CACHE_TAGS, CACHE_TTL } from '@/lib/cacheTags'
import type { PostLocale } from './strings'

const fetchPostBySlug = async ({
  slug,
  locale,
  draft,
}: {
  slug: string
  locale: PostLocale
  draft: boolean
}) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    locale,
    where: { slug: { equals: slug } },
    depth: 2,
  })

  return (result.docs?.[0] as Post | undefined) ?? null
}

// Published post persisted in the data cache (R2), tagged for the Posts publish
// hook. Draft/live-preview bypasses the cache.
const cachedPostBySlug = (slug: string, locale: PostLocale) =>
  unstable_cache(() => fetchPostBySlug({ slug, locale, draft: false }), ['post', slug, locale], {
    tags: [CACHE_TAGS.posts],
    revalidate: CACHE_TTL,
  })()

// Cached raw doc — shared by the page AND its metadata (resolved once per request).
export const queryPostBySlug = cache(
  async ({ slug, locale }: { slug: string; locale: PostLocale }) => {
    const { isEnabled: draft } = await draftMode()
    if (draft) return fetchPostBySlug({ slug, locale, draft: true })
    return cachedPostBySlug(slug, locale)
  },
)

// The normalized shape the page renders — pure data, no UI copy. Relations are
// resolved to their objects; the banner falls back from postBanner to featured.
export type PostView = {
  doc: Post
  bannerImage: Media | null
  authors: User[]
  tags: Tag[]
  related: PostItem[]
}

export async function getPost(slug: string, locale: PostLocale): Promise<PostView | null> {
  const doc = await queryPostBySlug({ slug, locale }) // reuses the cache
  if (!doc) return null

  const featuredImage =
    doc.featuredImage && typeof doc.featuredImage === 'object' ? (doc.featuredImage as Media) : null
  const postBanner =
    doc.postBanner && typeof doc.postBanner === 'object' ? (doc.postBanner as Media) : null
  const bannerImage = postBanner ?? featuredImage

  const authors = ((doc.authors as User[]) ?? []).filter((a) => typeof a === 'object')
  const tags = ((doc.tags as Tag[]) ?? []).filter((t) => typeof t === 'object')

  const related: PostItem[] = ((doc.relatedPosts as Post[]) ?? [])
    .filter((r) => typeof r === 'object')
    .map((r) => {
      const img = r.featuredImage && typeof r.featuredImage === 'object' ? (r.featuredImage as Media) : null
      const rtags = ((r.tags as Tag[]) ?? []).filter((t) => typeof t === 'object')
      return {
        id: String(r.id),
        title: r.title,
        slug: r.slug,
        excerpt: r.excerpt ?? null,
        date: r.publishedAt ?? null,
        categoryId: rtags[0] ? String(rtags[0].id) : null,
        categoryLabel: rtags[0]?.title ?? null,
        image: img,
      }
    })

  return { doc, bannerImage, authors, tags, related }
}
