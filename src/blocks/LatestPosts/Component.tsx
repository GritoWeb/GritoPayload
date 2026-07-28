import React from 'react'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { LatestPostsBlock, Tag, Media } from '@/payload-types'
import { PostCard, type PostItem } from '@/blocks/BlogListing/BlogListingClient'
import { Button } from '@/components/Button'
import { parseTitle } from '@/utilities/parseTitle'
import { titleMaxWidthClass, type TitleMaxWidth } from '@/utilities/titleMaxWidthClass'
import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { CACHE_TAGS, CACHE_TTL } from '@/lib/cacheTags'

// Latest 3 published posts — same for everyone, so persisted in the data cache
// and invalidated by the Posts publish hook.
const getLatestPosts = unstable_cache(
  async (): Promise<PostItem[]> => {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: 3,
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
    })

    return result.docs.map((post) => {
      const firstTag = Array.isArray(post.tags) && post.tags.length > 0 ? (post.tags[0] as Tag) : null
      const featuredImage = post.featuredImage && typeof post.featuredImage === 'object' ? (post.featuredImage as Media) : null
      const metaImage = post.meta?.image && typeof post.meta.image === 'object' ? (post.meta.image as Media) : null

      return {
        id: String(post.id),
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? post.meta?.description ?? null,
        date: post.publishedAt ?? null,
        categoryId: firstTag?.id != null ? String(firstTag.id) : null,
        categoryLabel: firstTag?.title ?? null,
        image: featuredImage ?? metaImage,
      }
    })
  },
  ['latest-posts'],
  { tags: [CACHE_TAGS.posts], revalidate: CACHE_TTL },
)

export const LatestPostsComponent: React.FC<LatestPostsBlock> = async ({
  eyebrow,
  title,
  titleMaxWidth,
  buttonLabel,
  buttonHref,
}) => {
  const posts = await getLatestPosts()

  return (
    <section className="px-5 section-y">
      <div className="container">
        <div className="mb-10">
          <header className="flex lg:flex-row flex-col items-center justify-between gap-3">
            <div>
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
            </div>

          </header>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
        {buttonLabel && (
          <div className="mt-10">
            <Button variant="blue" href={buttonHref ?? '/posts'} icon={<ArrowIcon size={24} />}>
              {buttonLabel}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
