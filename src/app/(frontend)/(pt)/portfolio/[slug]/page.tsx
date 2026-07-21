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
import { MetaStrip } from '@/components/ui/MetaStrip'
import { Gallery, type GalleryItem } from '@/components/ui/Gallery'
import { BigQuote } from '@/components/ui/BigQuote'
import { ResultsGrid } from '@/components/ui/ResultsGrid'
import { FaleComAGente } from '@/components/sections/FaleComAGente'
import { PortfolioCardGrid, type PortfolioItem } from '@/blocks/PortfolioListing/PortfolioListingClient'
import { Sparkle, ChatMark } from '@/home/illustrations'

export const dynamic = 'force-dynamic'

const locale = 'pt' as const

type Args = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const portfolio = await queryPortfolioBySlug({ slug: decodedSlug })
  return generateMeta({ doc: portfolio, locale, path: `/portfolio/${decodedSlug}` })
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
    { label: 'Cliente', value: p.client },
    p.sector ? { label: 'Setor', value: p.sector } : null,
    p.deliverables ? { label: 'Entregas', value: p.deliverables } : null,
    p.duration ? { label: 'Duração', value: p.duration } : null,
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
        tagId: rtag ? String(rtag.id) : null,
        tagLabel: rtag?.title ?? null,
        tagVariant: (r.tagVariant as 'blue' | 'orange') ?? 'blue',
        accent: (r.accent as 'blue' | 'orange') ?? 'blue',
        image: img,
      }
    })

  const breadcrumbItems = [
    { label: 'Portfólio', href: '/portfolio' },
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
            </div>
            <h1 className="m-0 text-blue max-w-3xl">
              <span className="font-light">{p.client} </span>
              <br />
              {parseTitle(p.title)}
            </h1>
            {p.summary && (
              <p className="mt-4 text-ink-soft max-w-xl leading-relaxed">{p.summary}</p>
            )}
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

      {/* ── Intro ───────────────────────────────────────────────────── */}
      {(p.introEyebrow || p.introTitle || p.introBody) && (
        <section className="px-5 py-16">
          <div
            className={
              p.introLayout === 'one'
                ? 'container max-w-3xl'
                : 'container grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start'
            }
          >
            <div>
              {p.introEyebrow && <p className="font-eyebrow m-0 mb-3">{p.introEyebrow}</p>}
              {p.introTitle && (
                <h2 className="m-0 text-blue">{parseTitle(p.introTitle)}</h2>
              )}
            </div>
            {p.introBody && (
              <div
                className={`prose max-w-none prose-p:text-ink-soft prose-p:leading-relaxed prose-headings:font-display prose-headings:text-blue prose-a:text-blue prose-strong:text-ink ${p.introLayout === 'one' ? 'mt-6' : ''}`}
              >
                <RichText data={p.introBody} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Processo ────────────────────────────────────────────────── */}
      {p.processSteps && p.processSteps.length > 0 && (
        <section className="bg-white border-y border-line px-5 py-16">
          <div className="container">
            <div className="mb-10">
              <p className="font-eyebrow text-orange m-0 mb-3">Processo</p>
              <h2 className="m-0 text-blue">Como fizemos</h2>
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

      {/* ── Galeria ──────────────────────────────────────────────────── */}
      {galleryItems.length > 0 && (
        <section className="px-5 py-16">
          <div className="container">
            <div className="flex items-end justify-between gap-6 flex-wrap mb-8">
              <div>
                <p className="font-eyebrow m-0 mb-3">Galeria</p>
                <h2 className="m-0">O que entregamos</h2>
              </div>
              <span className="font-body text-[13px] text-mute">
                {galleryItems.length} imagens do projeto
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

      {/* ── Resultados ───────────────────────────────────────────────── */}
      {p.stats && p.stats.length > 0 && (
        <section className="px-5 py-16">
          <div className="container">
            <div className="mb-8">
              <p className="font-eyebrow m-0 mb-3">Resultados</p>
              <h2 className="m-0 text-blue">O que <span className="text-orange">aconteceu</span> depois</h2>
            </div>
            <ResultsGrid stats={p.stats as { value: string; label: string }[]} />
          </div>
        </section>
      )}

      {/* ── Stack ────────────────────────────────────────────────────── */}
      {p.stack && p.stack.length > 0 && (
        <section className="px-5 py-13">
          <div className="container">
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
        </section>
      )}

      {/* ── Projetos relacionados ─────────────────────────────────────── */}
      {relatedPortfolios.length > 0 && (
        <section className="bg-white border-t border-line px-5 py-16">
          <div className="container">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
              <div>
                <p className="font-eyebrow m-0 mb-3">Continue navegando</p>
                <h2 className="m-0">Projetos relacionados</h2>
              </div>
              <Link href="/portfolio" className="font-display font-medium text-sm text-blue no-underline hover:opacity-75 transition-opacity">
                Ver portfólio completo <ArrowIcon size={24} />
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
