import React from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { generateMeta } from '@/utilities/generateMeta'
import { parseTitle } from '@/utilities/parseTitle'
import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { Avatar } from '@/components/ui/Avatar'
import { FaleComAGente } from '@/components/sections/FaleComAGente'
import { PostCard } from '@/blocks/BlogListing/BlogListingClient'
import { ChatMark } from '@/home/illustrations'

import { getPost, queryPostBySlug } from './getPost'
import { strings, dateLocale, blogBase, postsBase, type PostLocale } from './strings'

type Args = { params: Promise<{ slug: string }> }

// ── Metadata ────────────────────────────────────────────────────────────────
export async function postMetadata(
  { params: paramsPromise }: Args,
  locale: PostLocale,
): Promise<Metadata> {
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug, locale })
  return generateMeta({ doc: post, locale, path: `${postsBase(locale)}/${decodedSlug}` })
}

// ── Page ────────────────────────────────────────────────────────────────────
export async function PostSinglePage({
  params: paramsPromise,
  locale,
}: Args & { locale: PostLocale }) {
  const t = strings[locale]
  const blog = blogBase(locale)

  const { slug } = await paramsPromise
  const data = await getPost(decodeURIComponent(slug), locale)
  if (!data) notFound()

  const { doc: p, bannerImage, authors, tags, related } = data

  const publishedDate = p.publishedAt
    ? new Intl.DateTimeFormat(dateLocale(locale), {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date(p.publishedAt))
    : null

  return (
    <>
      {/* ── Post banner ──────────────────────────────────────────── */}
      {bannerImage?.url && (
        <div className="px-5 mt-20">
          <div className="max-w-[1024px] mx-auto">
            <div
              className="relative rounded-3xl overflow-hidden bg-blue/8"
              style={{ aspectRatio: bannerImage.width && bannerImage.height ? `${bannerImage.width}/${bannerImage.height}` : '16/9' }}
            >
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

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="px-5 pt-10 md:pt-14">
        <div className="max-w-[1024px] mx-auto">
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

          <div className="flex flex-wrap items-center gap-5 mt-2">
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
              <time dateTime={p.publishedAt ?? undefined} className="font-body font-bold text-xs text-mute">
                {publishedDate}
              </time>
            )}
          </div>
        </div>
      </section>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <section className="px-5 pb-16">
        <div className="max-w-[1024px] mx-auto prose prose-lg prose-headings:font-display prose-headings:text-blue prose-a:text-blue prose-strong:text-ink">
          <RichText data={p.content} />
        </div>
      </section>

      {/* ── Tags footer ─────────────────────────────────────────────── */}
      {tags.length > 0 && (
        <div className="px-5 pb-10 border-b border-line">
          <div className="max-w-[1024px] mx-auto flex flex-wrap gap-2 items-center">
            <span className="font-body text-xs text-mute uppercase tracking-widest font-bold mr-1">{t.tags}</span>
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`${blog}?tag=${tag.slug}`}
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
            <p className="font-eyebrow m-0 mb-5">{t.aboutAuthor}</p>
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
      {related.length > 0 && (
        <section className="bg-white border-t border-line px-5 py-16">
          <div className="container">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
              <div>
                <p className="font-eyebrow m-0 mb-3">{t.keepReading}</p>
                <h2 className="m-0">{t.relatedPosts}</h2>
              </div>
              <Link href={blog} className="font-display font-medium text-sm text-blue no-underline hover:opacity-75 transition-opacity">
                {t.viewAll} <ArrowIcon size={24} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((item, i) => (
                <PostCard key={item.id} post={item} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Fale com a gente ─────────────────────────────────────────── */}
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
