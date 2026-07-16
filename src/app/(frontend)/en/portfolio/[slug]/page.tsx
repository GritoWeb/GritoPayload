import React, { cache } from 'react'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'

import type { Metadata } from 'next'

import type { Portfolio, Media, PortfolioTag } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import { parseTitle } from '@/utilities/parseTitle'
import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { Button } from '@/components/Button'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { MetaStrip } from '@/components/ui/MetaStrip'
import { Gallery, type GalleryItem } from '@/components/ui/Gallery'
import { BigQuote } from '@/components/ui/BigQuote'
import { ResultsGrid } from '@/components/ui/ResultsGrid'
import { Avatar } from '@/components/ui/Avatar'
import { FaleComAGente } from '@/components/sections/FaleComAGente'
import { PortfolioCardGrid, type PortfolioItem } from '@/blocks/PortfolioListing/PortfolioListingClient'
import { Sparkle, ChatMark } from '@/home/illustrations'

export const dynamic = 'force-dynamic'

const locale = 'en' as const

type Args = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const portfolio = await queryPortfolioBySlug({ slug: decodedSlug })
  return generateMeta({ doc: portfolio, locale, path: `/en/portfolio/${decodedSlug}` })
}

export default async function PortfolioPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await paramsPromise
  const portfolio = await queryPortfolioBySlug({ slug: decodeURIComponent(slug) })
  if (!portfolio) notFound()

  const p = portfolio as Portfolio
  const tag = p.tag && typeof p.tag === 'object' ? (p.tag as PortfolioTag) : null
  const coverImage = p.image && typeof p.image === 'object' ? (p.image as Media) : null

  const metaItems = [
    { label: 'Client', value: p.client },
    p.sector ? { label: 'Sector', value: p.sector } : null,
    p.deliverables ? { label: 'Deliverables', value: p.deliverables } : null,
    p.duration ? { label: 'Duration', value: p.duration } : null,
    p.year && !p.sector && !p.deliverables && !p.duration ? { label: 'Year', value: p.year } : null,
  ].filter(Boolean) as { label: string; value: string }[]

  const galleryItems: GalleryItem[] = (p.gallery ?? [])
    .map((item) => {
      const img = item.image && typeof item.image === 'object' ? (item.image as Media) : null
      if (!img?.url) return null
      return {
        url: img.url,
        alt: img.alt ?? item.label ?? p.title,
        width: img.width ?? undefined,
        height: img.height ?? undefined,
        accent: (item.accent as 'blue' | 'orange') ?? 'blue',
        label: item.label ?? undefined,
      }
    })
    .filter(Boolean) as GalleryItem[]

  const relatedPortfolios: PortfolioItem[] = ((p.relatedPortfolios as Portfolio[]) ?? [])
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
        year: r.year ?? null,
        tagId: rtag ? String(rtag.id) : null,
        tagLabel: rtag?.title ?? null,
        tagVariant: (r.tagVariant as 'blue' | 'orange') ?? 'blue',
        accent: (r.accent as 'blue' | 'orange') ?? 'blue',
        image: img,
      }
    })

  const breadcrumbItems = [
    { label: 'Portfolio', href: '/en/portfolio' },
    ...(tag ? [{ label: tag.title }] : []),
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
        <div className="container grid grid-cols-1 md:grid-cols-[1.25fr_1fr] gap-12 md:gap-16 items-center">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {tag && (
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full font-body text-xs font-bold uppercase tracking-[0.04em] ${p.tagVariant === 'orange' ? 'bg-orange/15 text-orange-700' : 'bg-blue/10 text-blue'}`}>
                  {tag.title}
                </span>
              )}
              {p.year && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full font-body text-xs font-bold uppercase tracking-[0.04em] bg-paper-dim text-mute">
                  {p.year}
                </span>
              )}
            </div>
            <h1 className="m-0 text-blue max-w-3xl">
              <span className="font-light">{p.client} </span>
              <br />
              {parseTitle(p.title)}
            </h1>
            {p.summary && (
              <p className="mt-4 text-ink-soft max-w-xl leading-relaxed">{p.summary}</p>
            )}
            <div className="flex flex-wrap gap-2.5 mt-7">
              {p.siteUrl && (
                <Button href={p.siteUrl} variant="primary">
                  View live site <ArrowIcon size={24} />
                </Button>
              )}
              <Button href={p.nextProjectHref ?? '/en/portfolio'} variant="ghost">
                Next project
              </Button>
            </div>
          </div>

          <div className="relative bg-blue rounded-3xl p-8 min-h-[300px] md:min-h-[420px] flex items-center justify-center overflow-hidden">
            {coverImage?.url ? (
              <Image
                src={coverImage.url}
                alt={coverImage.alt ?? p.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <span className="font-display font-black text-[8rem] text-white/10 select-none">
                {p.client.charAt(0)}
              </span>
            )}
            <Sparkle size={60} color="#FE9D2B" className="absolute -top-5 -right-5 opacity-80" />
          </div>
        </div>
      </section>

      {/* ── Meta strip ──────────────────────────────────────────────── */}
      {metaItems.length > 0 && (
        <div className="px-5 pb-8">
          <div className="container">
            <MetaStrip items={metaItems.slice(0, 4)} />
          </div>
        </div>
      )}

      {/* ── Challenge ───────────────────────────────────────────────── */}
      {(p.challengeTitle || p.challengeBody) && (
        <section className="px-5 py-16">
          <div className="container grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
            <div>
              <p className="font-eyebrow m-0 mb-3">The challenge</p>
              {p.challengeTitle && (
                <h2 className="m-0 text-blue">{parseTitle(p.challengeTitle)}</h2>
              )}
            </div>
            {p.challengeBody && (
              <div className="text-ink-soft leading-relaxed space-y-4">
                {p.challengeBody.split('\n\n').map((paragraph) => (
                  <p key={paragraph} className="m-0">{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Process ─────────────────────────────────────────────────── */}
      {p.processSteps && p.processSteps.length > 0 && (
        <section className="bg-white border-y border-line px-5 py-16">
          <div className="container">
            <div className="mb-10">
              <p className="font-eyebrow text-orange m-0 mb-3">Process</p>
              <h2 className="m-0 text-blue">How we did it</h2>
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 list-none p-0 m-0">
              {p.processSteps.map((step) => (
                <li key={step.id ?? step.number}>
                  {step.number && (
                    <p className="m-0 font-display font-black text-[56px] leading-none text-orange">
                      {step.number}
                    </p>
                  )}
                  {step.title && (
                    <h3 className="mt-1 m-0 font-bold text-blue text-xl">{step.title}</h3>
                  )}
                  {step.description && (
                    <p className="mt-2 m-0 text-[15px] text-mute leading-relaxed">{step.description}</p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ── Gallery ──────────────────────────────────────────────────── */}
      {galleryItems.length > 0 && (
        <section className="px-5 py-16">
          <div className="container">
            <div className="flex items-end justify-between gap-6 flex-wrap mb-8">
              <div>
                <p className="font-eyebrow m-0 mb-3">Gallery</p>
                <h2 className="m-0">What we delivered</h2>
              </div>
              <span className="font-body text-[13px] text-mute">
                {galleryItems.length} project images
              </span>
            </div>
            <Gallery items={galleryItems} />
          </div>
        </section>
      )}

      {/* ── Big Quote ────────────────────────────────────────────────── */}
      {p.quoteText && (
        <div className="px-5 py-8">
          <BigQuote
            quote={p.quoteText}
            author={p.quoteAuthor}
            role={p.quoteRole}
          />
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────── */}
      {p.stats && p.stats.length > 0 && (
        <section className="px-5 py-16">
          <div className="container">
            <div className="mb-8">
              <p className="font-eyebrow m-0 mb-3">Results</p>
              <h2 className="m-0 text-blue">What <span className="text-orange">happened</span> after</h2>
            </div>
            <ResultsGrid stats={p.stats as { value: string; label: string }[]} />
          </div>
        </section>
      )}

      {/* ── Team & Stack ─────────────────────────────────────────────── */}
      {((p.team && p.team.length > 0) || (p.stack && p.stack.length > 0)) && (
        <section className="px-5 pb-16">
          <div className="container grid grid-cols-1 md:grid-cols-2 gap-12">
            {p.team && p.team.length > 0 && (
              <div>
                <p className="font-eyebrow m-0 mb-3">Team</p>
                <h3 className="m-0 mb-5 text-2xl font-bold">Who built it</h3>
                <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
                  {p.team.map((member) => (
                    <li key={member.id ?? member.name} className="flex items-center gap-3.5">
                      <Avatar name={member.name ?? ''} variant="blue" size="md" />
                      <div>
                        <div className="font-display font-medium">{member.name}</div>
                        <div className="text-[13px] text-mute">{member.role}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {p.stack && p.stack.length > 0 && (
              <div>
                <p className="font-eyebrow m-0 mb-3">Tools</p>
                <h3 className="m-0 mb-5 text-2xl font-bold">Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {p.stack.map((item) => (
                    <span
                      key={item.id ?? item.tool}
                      className="inline-flex items-center px-3 py-1.5 rounded-full font-body text-xs font-bold uppercase tracking-[0.04em] bg-paper-dim text-ink-soft border border-line"
                    >
                      {item.tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Related projects ─────────────────────────────────────────── */}
      {relatedPortfolios.length > 0 && (
        <section className="bg-white border-t border-line px-5 py-16">
          <div className="container">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
              <div>
                <p className="font-eyebrow m-0 mb-3">Keep exploring</p>
                <h2 className="m-0">Related projects</h2>
              </div>
              <Link href="/en/portfolio" className="font-display font-medium text-sm text-blue no-underline hover:opacity-75 transition-opacity">
                View full portfolio <ArrowIcon size={24} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPortfolios.map((item) => (
                <PortfolioCardGrid key={item.id} item={item} />
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

const queryPortfolioBySlug = cache(async ({ slug }: { slug: string }) => {
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

  return result.docs?.[0] ?? null
})
