import React, { cache } from 'react'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Metadata } from 'next'

import type { Post, Media, Tag, User } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { parseTitle } from '@/utilities/parseTitle'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Avatar } from '@/components/ui/Avatar'
import { FaleComAGente } from '@/components/sections/FaleComAGente'
import { PostCard, type PostItem } from '@/blocks/BlogListing/BlogListingClient'
import { ChatMark } from '@/home/illustrations'

export const dynamic = 'force-dynamic'

const locale = 'en' as const

type Args = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })
  return generateMeta({ doc: post, locale, path: `/en/posts/${decodedSlug}` })
}

export default async function PostPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const post = await queryPostBySlug({ slug: decodeURIComponent(slug) })
  if (!post) notFound()

  const p = post as Post
  const featuredImage = p.featuredImage && typeof p.featuredImage === 'object' ? (p.featuredImage as Media) : null
  const postBanner = p.postBanner && typeof p.postBanner === 'object' ? (p.postBanner as Media) : null
  const bannerImage = postBanner ?? featuredImage
  const authors = ((p.authors as User[]) ?? []).filter((a) => typeof a === 'object')
  const tags = ((p.tags as Tag[]) ?? []).filter((t) => typeof t === 'object')
  const relatedPosts: PostItem[] = ((p.relatedPosts as Post[]) ?? [])
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

  const firstTag = tags[0] ?? null
  const publishedDate = p.publishedAt
    ? new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(p.publishedAt))
    : null

  const breadcrumbItems = [
    { label: 'Blog', href: '/en/blog' },
    ...(firstTag ? [{ label: firstTag.title }] : []),
    { label: p.title },
  ]

  return (
    <>
      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <div className="px-5 pt-6">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="px-5 py-10 md:py-14">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-5">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-3 py-1.5 rounded-full font-body text-xs font-bold uppercase tracking-[0.04em] bg-blue/10 text-blue"
              >
                {tag.title}
              </span>
            ))}
          </div>

          <h1 className="m-0 text-blue">{parseTitle(p.title)}</h1>

          <div className="flex flex-wrap items-center gap-5 mt-7">
            {authors.length > 0 && (
              <div className="flex items-center gap-3">
                {authors.length === 1 ? (
                  <Avatar name={authors[0]!.email} variant="blue" size="sm" />
                ) : (
                  <div className="flex -space-x-2">
                    {authors.slice(0, 3).map((a) => (
                      <Avatar key={a.id} name={a.email} variant="blue" size="sm" />
                    ))}
                  </div>
                )}
                <span className="font-body text-sm text-mute">
                  {authors.map((a) => a.email).join(', ')}
                </span>
              </div>
            )}
            {publishedDate && (
              <time dateTime={p.publishedAt ?? undefined} className="font-mono text-xs text-mute">
                {publishedDate}
              </time>
            )}
          </div>
        </div>
      </section>

      {/* ── Post banner ──────────────────────────────────────────── */}
      {bannerImage?.url && (
        <div className="px-5 pb-12">
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden bg-blue/8" style={{ aspectRatio: bannerImage.width && bannerImage.height ? `${bannerImage.width}/${bannerImage.height}` : '16/9' }}>
              <Image
                src={bannerImage.url}
                alt={bannerImage.alt ?? p.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────── */}
      <section className="px-5 pb-16">
        <div className="max-w-3xl mx-auto prose prose-lg prose-headings:font-display prose-headings:text-blue prose-a:text-blue prose-strong:text-ink">
          <RichText data={p.content} />
        </div>
      </section>

      {/* ── Tags footer ─────────────────────────────────────────────── */}
      {tags.length > 0 && (
        <div className="px-5 pb-10 border-b border-line">
          <div className="max-w-3xl mx-auto flex flex-wrap gap-2 items-center">
            <span className="font-body text-xs text-mute uppercase tracking-widest font-bold mr-1">Tags</span>
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/en/blog?tag=${tag.slug}`}
                className="inline-flex items-center px-3 py-1.5 rounded-full font-body text-xs font-bold uppercase tracking-[0.04em] bg-paper-dim text-ink-soft border border-line no-underline hover:border-blue hover:text-blue transition-colors"
              >
                {tag.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Author bio ──────────────────────────────────────────────── */}
      {authors.length > 0 && (
        <section className="px-5 py-14">
          <div className="max-w-3xl mx-auto">
            <p className="font-eyebrow m-0 mb-5">About the author</p>
            <div className="flex flex-col gap-6">
              {authors.map((author) => (
                <div key={author.id} className="flex items-center gap-4">
                  <Avatar name={author.email} variant="blue" size="lg" />
                  <div>
                    <div className="font-display font-bold text-ink">{author.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Related posts ────────────────────────────────────────────── */}
      {relatedPosts.length > 0 && (
        <section className="bg-white border-t border-line px-5 py-16">
          <div className="container">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
              <div>
                <p className="font-eyebrow m-0 mb-3">Keep reading</p>
                <h2 className="m-0">Related posts</h2>
              </div>
              <Link href="/en/blog" className="font-display font-medium text-sm text-blue no-underline hover:opacity-75 transition-opacity">
                View all posts <ArrowIcon size={24} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((item, i) => (
                <PostCard key={item.id} post={item} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <FaleComAGente
        email="contato@gritoweb.com.br"
        emailHref="mailto:contato@gritoweb.com.br"
        phone="(51) 99999-9999"
        phoneHref="tel:+5551999999999"
        chatMark={<ChatMark size={120} />}
      />
    </>
  )
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
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

  return result.docs?.[0] ?? null
})
