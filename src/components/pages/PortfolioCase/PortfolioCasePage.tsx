import React from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { generateMeta } from '@/utilities/generateMeta'
import { parseTitle } from '@/utilities/parseTitle'
import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { MetaStrip, type MetaItem } from '@/components/ui/MetaStrip'
import { Gallery } from '@/components/ui/Gallery'
import { BigQuote } from '@/components/ui/BigQuote'
import { ResultsGrid } from '@/components/ui/ResultsGrid'
import { PortfolioTimeline } from '@/components/ui/PortfolioTimeline'
import { FaleComAGente } from '@/components/sections/FaleComAGente'
import { ChatMark } from '@/home/illustrations'

import { getPortfolioCase, queryPortfolioBySlug } from './getPortfolioCase'
import { strings, basePath, type PortfolioLocale } from './strings'

// Reading column — same width as the blog (max-w-[1024px]) so text fills it
// instead of leaving whitespace beside a narrow measure.
const shell = 'mx-auto max-w-[1024px]'

type Args = { params: Promise<{ slug: string }> }

// ── Metadata ────────────────────────────────────────────────────────────────
export async function portfolioMetadata(
  { params: paramsPromise }: Args,
  locale: PortfolioLocale,
): Promise<Metadata> {
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const doc = await queryPortfolioBySlug({ slug: decodedSlug, locale })
  return generateMeta({ doc, locale, path: `${basePath(locale)}/${decodedSlug}` })
}

// ── Page ────────────────────────────────────────────────────────────────────
export async function PortfolioCasePage({
  params: paramsPromise,
  locale,
}: Args & { locale: PortfolioLocale }) {
  const t = strings[locale]
  const base = basePath(locale)

  const { slug } = await paramsPromise
  const data = await getPortfolioCase(decodeURIComponent(slug), locale)
  if (!data) notFound()

  const { doc: p, tag, coverImage, stack, gallery, next } = data

  // The only logic left here is presentational: pairing i18n labels with values.
  const facts = [
    { label: t.factClient, value: p.client },
    p.sector ? { label: t.factSector, value: p.sector, small: true } : null,
    p.deliverables ? { label: t.factDeliverables, value: p.deliverables, small: true } : null,
    p.duration ? { label: t.factDuration, value: p.duration } : null,
    p.since ? { label: t.factSince, value: p.since } : null,
    stack ? { label: t.factStack, value: stack, small: true } : null,
  ].filter(Boolean) as MetaItem[]

  const breadcrumbItems = [
    { label: t.portfolio, href: base },
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
            <p className="font-eyebrow m-0">{t.process}</p>
            <h2 className="m-0 mt-2 text-blue">{t.processTitle}</h2>
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
      {gallery.length > 0 && (
        <section className="px-5">
          <div className={`${shell} border-t border-line py-12`}>
            <div className="mb-8">
              <p className="font-eyebrow m-0 mb-2">{t.gallery}</p>
              <h2 className="m-0 text-blue">{t.galleryTitle}</h2>
            </div>
            <Gallery items={gallery} />
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
            <p className="font-eyebrow m-0">{t.results}</p>
            <h2 className="m-0 mb-2 mt-2 text-blue">
              {t.resultsA}
              <span className="text-orange">{t.resultsHighlight}</span>
              {t.resultsB}
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
              <p className="font-eyebrow m-0">{t.keepExploring}</p>
              <Link
                href={base}
                className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap font-display text-sm font-medium text-blue no-underline transition-opacity hover:opacity-75"
              >
                {t.viewAll} <ArrowIcon size={20} />
              </Link>
            </div>
            <Link
              href={`${base}/${next.slug}`}
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
                  {t.nextCase}
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
