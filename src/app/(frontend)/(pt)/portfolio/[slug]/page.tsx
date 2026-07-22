import React, { cache } from 'react'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'

import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Portfolio, Media, PortfolioTag } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import { parseTitle } from '@/utilities/parseTitle'
import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { MetaStrip, type MetaItem } from '@/components/ui/MetaStrip'
import { Gallery, type GalleryItem } from '@/components/ui/Gallery'
import { BigQuote } from '@/components/ui/BigQuote'
import { ResultsGrid } from '@/components/ui/ResultsGrid'
import { PortfolioTimeline } from '@/components/ui/PortfolioTimeline'
import { FaleComAGente } from '@/components/sections/FaleComAGente'
import { type PortfolioItem } from '@/blocks/PortfolioListing/PortfolioListingClient'
import { ChatMark } from '@/home/illustrations'

export const dynamic = 'force-dynamic'

const locale = 'pt' as const

// Reading column — same width as the blog (max-w-[1024px]) so text fills it
// instead of leaving whitespace beside a narrow measure.
const shell = 'mx-auto max-w-[1024px]'

type Args = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const portfolio = await queryPortfolioBySlug({ slug: decodedSlug })
  return generateMeta({ doc: portfolio, locale, path: `/portfolio/${decodedSlug}` })
}

export default async function PortfolioPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const portfolio = await queryPortfolioBySlug({ slug: decodeURIComponent(slug) })
  if (!portfolio) notFound()

  const p = portfolio as Portfolio
  const tag = p.tag && typeof p.tag === 'object' ? (p.tag as PortfolioTag) : null
  const coverImage = p.image && typeof p.image === 'object' ? (p.image as Media) : null

  const stackValue = (p.stack ?? [])
    .map((item) => item.tool)
    .filter(Boolean)
    .join(' · ')

  const facts = [
    { label: 'Cliente', value: p.client },
    p.sector ? { label: 'Setor', value: p.sector, small: true } : null,
    p.deliverables ? { label: 'Entregas', value: p.deliverables, small: true } : null,
    p.duration ? { label: 'Duração', value: p.duration } : null,
    p.since ? { label: 'Desde', value: p.since } : null,
    stackValue ? { label: 'Stack', value: stackValue, small: true } : null,
  ].filter(Boolean) as MetaItem[]

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
        tagId: rtag ? String(rtag.id) : null,
        tagLabel: rtag?.title ?? null,
        tagVariant: (r.tagVariant as 'blue' | 'orange') ?? 'blue',
        accent: (r.accent as 'blue' | 'orange') ?? 'blue',
        image: img,
      }
    })
  const next = relatedPortfolios[0] ?? null

  const breadcrumbItems = [
    { label: 'Portfólio', href: '/portfolio' },
    ...(tag ? [{ label: tag.title }] : []),
    { label: p.title },
  ]

  return (
    <>
      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <div className="px-5 pt-6">
        <div className={shell}>
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="px-5 pb-10 pt-6">
        <div className={shell}>
          {tag && (
            <span className="mb-[18px] inline-block rounded-full bg-blue/[0.08] px-3 py-1.5 text-[0.72rem] font-extrabold uppercase tracking-[0.06em] text-blue">
              {tag.title}
            </span>
          )}
          <h1 className="m-0 text-blue">
            <span className="mb-0.5 block text-[0.5em] font-light leading-tight text-blue/55">{p.client}</span>
            {parseTitle(p.title)}
          </h1>
          {p.summary && (
            <p className="mt-4 max-w-[48ch] text-[1.15rem] leading-relaxed text-ink-soft">{p.summary}</p>
          )}

          <div className="relative mt-8 flex h-[clamp(200px,34vw,330px)] items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br from-blue to-blue-600">
            {coverImage?.url ? (
              <Image
                src={coverImage.url}
                alt={coverImage.alt ?? p.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
              />
            ) : (
              <>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:repeating-linear-gradient(135deg,#fff_0_2px,transparent_2px_16px)]"
                />
                <span className="relative font-display text-2xl font-black tracking-wide text-white/90">
                  {p.client}
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Facts rail ──────────────────────────────────────────────── */}
      {facts.length > 0 && (
        <section className="px-5 pb-12">
          <div className={shell}>
            <MetaStrip items={facts} />
          </div>
        </section>
      )}

      {/* ── Intro ───────────────────────────────────────────────────── */}
      {(p.introEyebrow || p.introTitle || p.introBody) && (
        <section className="px-5">
          <div className={`${shell} border-t border-line py-12`}>
            {p.introLayout === 'two' ? (
              <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-14">
                <div>
                  <div className="mb-5 h-[3px] w-11 rounded-sm bg-orange" />
                  {p.introEyebrow && <p className="font-eyebrow m-0 mb-2">{p.introEyebrow}</p>}
                  {p.introTitle && <h2 className="m-0 text-blue">{parseTitle(p.introTitle)}</h2>}
                </div>
                {p.introBody && (
                  <div className="prose max-w-none prose-p:leading-relaxed prose-p:text-ink-soft prose-headings:font-display prose-headings:text-blue prose-a:text-blue prose-strong:text-ink">
                    <RichText data={p.introBody} />
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="mb-5 h-[3px] w-11 rounded-sm bg-orange" />
                {p.introEyebrow && <p className="font-eyebrow m-0 mb-2">{p.introEyebrow}</p>}
                {p.introTitle && <h2 className="m-0 max-w-[20ch] text-blue">{parseTitle(p.introTitle)}</h2>}
                {p.introBody && (
                  <div className="prose mt-6 max-w-none prose-p:leading-relaxed prose-p:text-ink-soft prose-headings:font-display prose-headings:text-blue prose-a:text-blue prose-strong:text-ink">
                    <RichText data={p.introBody} />
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* ── Process (timeline) ──────────────────────────────────────── */}
      {p.processSteps && p.processSteps.length > 0 && (
        <section className="px-5">
          <div className={`${shell} border-t border-line py-12`}>
            <p className="font-eyebrow m-0">Processo</p>
            <h2 className="m-0 mt-2 text-blue">Como fizemos</h2>
            <PortfolioTimeline
              steps={p.processSteps.map((step) => ({
                number: step.number,
                title: step.title,
                description: step.description,
                id: step.id,
              }))}
            />
          </div>
        </section>
      )}

      {/* ── Gallery ──────────────────────────────────────────────────── */}
      {galleryItems.length > 0 && (
        <section className="px-5">
          <div className={`${shell} border-t border-line py-12`}>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="font-eyebrow m-0 mb-2">Galeria</p>
                <h2 className="m-0 text-blue">O que entregamos</h2>
              </div>
              <span className="font-body text-[13px] text-mute">{galleryItems.length} imagens do projeto</span>
            </div>
            <Gallery items={galleryItems} />
          </div>
        </section>
      )}

      {/* ── Client quote ─────────────────────────────────────────────── */}
      {(p.quoteHighlight || p.quoteText) && (
        <section className="px-5">
          <div className={`${shell} border-t border-line py-12`}>
            <BigQuote
              highlight={p.quoteHighlight}
              body={p.quoteText}
              author={p.quoteAuthor}
              role={p.quoteRole}
            />
          </div>
        </section>
      )}

      {/* ── Results ──────────────────────────────────────────────────── */}
      {p.stats && p.stats.length > 0 && (
        <section className="px-5">
          <div className={`${shell} border-t border-line py-12`}>
            <p className="font-eyebrow m-0">Resultados</p>
            <h2 className="m-0 mb-2 mt-2 text-blue">
              O que <span className="text-orange">aconteceu</span> depois
            </h2>
            <div className="mt-6">
              <ResultsGrid stats={p.stats as { value: string; label: string }[]} />
            </div>
          </div>
        </section>
      )}

      {/* ── Next case ────────────────────────────────────────────────── */}
      {next && (
        <section className="px-5">
          <div className={`${shell} border-t border-line py-12`}>
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <p className="font-eyebrow m-0">Continue navegando</p>
              <Link
                href="/portfolio"
                className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap font-display text-sm font-medium text-blue no-underline transition-opacity hover:opacity-75"
              >
                Ver portfólio completo <ArrowIcon size={20} />
              </Link>
            </div>
            <Link
              href={`/portfolio/${next.slug}`}
              className="flex items-center gap-5 rounded-[20px] border border-line bg-white p-5 no-underline transition-shadow hover:shadow-[0_8px_24px_rgba(40,40,40,0.07)]"
            >
              <span className="relative flex h-[72px] w-24 flex-none items-center justify-center overflow-hidden rounded-xl bg-orange p-1.5 text-center text-[0.7rem] font-black text-white">
                {next.image?.url ? (
                  <Image src={next.image.url} alt={next.image.alt ?? next.title} fill className="object-cover" sizes="96px" />
                ) : (
                  next.title
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-orange">
                  Próximo case
                </span>
                <h3 className="m-0 mt-0.5 text-blue">{next.title}</h3>
                {(next.result || next.client) && (
                  <p className="m-0 mt-0.5 text-[0.9rem] text-mute">{next.result ?? next.client}</p>
                )}
              </span>
              <span aria-hidden="true" className="flex-none text-2xl font-black text-blue">
                →
              </span>
            </Link>
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
