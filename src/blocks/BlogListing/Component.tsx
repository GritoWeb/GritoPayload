import React from 'react'
import { headers } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { BlogListingBlock, Post, Tag, Media } from '@/payload-types'
import type { TitleMaxWidth } from '@/utilities/titleMaxWidthClass'
import { CACHE_TAGS, CACHE_TTL } from '@/lib/cacheTags'
import { BlogListingClient, type PostItem, type FilterOption, type FeaturedPostItem } from './BlogListingClient'

type PartialPost = Pick<Post, 'id' | 'title' | 'slug' | 'excerpt' | 'tags' | 'publishedAt' | 'featuredImage' | 'meta'>

function normalizePost(post: PartialPost): PostItem {
  const firstTag =
    Array.isArray(post.tags) && post.tags.length > 0 ? (post.tags[0] as Tag) : null

  const featuredImage =
    post.featuredImage && typeof post.featuredImage === 'object'
      ? (post.featuredImage as Media)
      : null

  const metaImage =
    post.meta?.image && typeof post.meta.image === 'object'
      ? (post.meta.image as Media)
      : null

  return {
    id: String(post.id),
    title: post.title ?? '',
    slug: post.slug,
    excerpt: post.excerpt ?? post.meta?.description ?? null,
    date: post.publishedAt ?? null,
    categoryId: firstTag?.id != null ? String(firstTag.id) : null,
    categoryLabel: firstTag?.title ?? null,
    image: featuredImage ?? metaImage,
  }
}

// The heavy browse dataset (up to 200 posts + all tags) is identical for every
// visitor of a given locale, so it's persisted in the data cache and invalidated
// by the Posts/Tags hooks. Keyed by locale; block-specific props stay out of it.
const getBrowseData = (locale: 'pt' | 'en') =>
  unstable_cache(
    async (): Promise<{ posts: PostItem[]; filters: FilterOption[] }> => {
      const payload = await getPayload({ config: configPromise })

      // Note: text search is served by /api/search (FTS5). This query only feeds the
      // default browse view (category filter + pagination run client-side over it).
      const [postsResult, tagsResult] = await Promise.all([
        payload.find({
          collection: 'posts',
          depth: 1,
          limit: 200,
          locale,
          overrideAccess: false,
          sort: '-publishedAt',
          select: {
            title: true,
            slug: true,
            excerpt: true,
            tags: true,
            publishedAt: true,
            featuredImage: true,
            meta: true,
          },
        }),
        payload.find({ collection: 'tags', depth: 0, limit: 100, locale, overrideAccess: false }),
      ])

      // Show a post only in the locale it has content for: skip posts with no title in
      // the active locale (they would otherwise render as blank cards).
      const posts: PostItem[] = postsResult.docs
        .filter((doc) => Boolean((doc as PartialPost).title))
        .map((doc) => normalizePost(doc as PartialPost))

      const filters: FilterOption[] = tagsResult.docs.map((tag) => ({
        label: tag.title,
        value: String(tag.id),
        slug: tag.slug,
      }))

      return { posts, filters }
    },
    ['blog-browse', locale],
    { tags: [CACHE_TAGS.posts, CACHE_TAGS.tags], revalidate: CACHE_TTL },
  )()

// The featured post is chosen per block instance, so cache it by (locale, id).
const getFeaturedPost = (locale: 'pt' | 'en', id: number) =>
  unstable_cache(
    async (): Promise<Post | null> => {
      const payload = await getPayload({ config: configPromise })
      const doc = await payload.findByID({
        collection: 'posts',
        id,
        depth: 1,
        locale,
        overrideAccess: false,
      })
      return doc ?? null
    },
    ['blog-featured', locale, String(id)],
    { tags: [CACHE_TAGS.posts], revalidate: CACHE_TTL },
  )()

export const BlogListingComponent: React.FC<BlogListingBlock> = async ({
  featuredPost,
  eyebrow,
  title,
  titleMaxWidth,
  postsPerPage,
  showSearch,
  showFilters,
}) => {
  // Locale comes from the x-locale header set by the middleware (pt default / en).
  const headersList = await headers()
  const locale = headersList.get('x-locale') === 'en' ? 'en' : 'pt'

  const featuredPostId =
    featuredPost && typeof featuredPost === 'object'
      ? (featuredPost as Post).id
      : (featuredPost as number | null)

  const [{ posts, filters }, featuredDoc] = await Promise.all([
    getBrowseData(locale),
    featuredPostId ? getFeaturedPost(locale, featuredPostId) : Promise.resolve(null),
  ])

  let featured: FeaturedPostItem | null = null
  if (featuredDoc && featuredDoc.title) {
    const base = normalizePost(featuredDoc)
    featured = {
      ...base,
      excerpt: featuredDoc.excerpt ?? featuredDoc.meta?.description ?? null,
    }
  }

  return (
    <BlogListingClient
      posts={posts}
      filters={filters}
      featuredPost={featured}
      eyebrow={eyebrow}
      title={title}
      titleMaxWidth={titleMaxWidth as TitleMaxWidth | null | undefined}
      postsPerPage={postsPerPage ?? 9}
      showSearch={showSearch ?? true}
      showFilters={showFilters ?? true}
      locale={locale}
    />
  )
}
