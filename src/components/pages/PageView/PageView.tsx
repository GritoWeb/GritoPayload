import React, { cache } from 'react'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { Metadata } from 'next'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { buildAsyncBlocks } from '@/blocks/buildAsyncBlocks'
import { generateMeta } from '@/utilities/generateMeta'
import { PageContent } from '@/components/PageContent'
import { CACHE_TAGS, CACHE_TTL } from '@/lib/cacheTags'
import type { Page } from '@/payload-types'

// Shared body for both the home page (slug "home") and every generic CMS page
// (slug from the route param). They render identically — hero + blocks, or the
// live-preview PageContent under draft mode — so the only per-route inputs are
// the slug, the locale, and the canonical path for metadata.

export type PageLocale = 'pt' | 'en'

const fetchPageBySlug = async ({
  slug,
  locale,
  draft,
}: {
  slug: string
  locale: PageLocale
  draft: boolean
}) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    locale,
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] ?? null
}

// Published pages are persisted in the data cache (R2), keyed by slug+locale and
// tagged so the Pages publish hook invalidates them. Draft/live-preview is never
// cached — it must always reflect the latest autosave.
const cachedPageBySlug = (slug: string, locale: PageLocale) =>
  unstable_cache(() => fetchPageBySlug({ slug, locale, draft: false }), ['page', slug, locale], {
    tags: [CACHE_TAGS.pages],
    revalidate: CACHE_TTL,
  })()

// Cached raw doc — shared by the page AND its metadata so we resolve it once per
// request (React cache), reading from the data cache instead of D1 when published.
const queryPageBySlug = cache(
  async ({ slug, locale, draft }: { slug: string; locale: PageLocale; draft: boolean }) => {
    if (draft) return fetchPageBySlug({ slug, locale, draft: true })
    return cachedPageBySlug(slug, locale)
  },
)

export async function pageMetadata({
  slug,
  locale,
  path,
}: {
  slug: string
  locale: PageLocale
  path: string
}): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const page = await queryPageBySlug({ slug, locale, draft })
  return generateMeta({ doc: page, locale, path })
}

export async function PageView({ slug, locale }: { slug: string; locale: PageLocale }) {
  const { isEnabled: draft } = await draftMode()
  const page = await queryPageBySlug({ slug, locale, draft })
  if (!page) notFound()

  if (draft) {
    const asyncBlocks = buildAsyncBlocks(page.layout)
    return (
      <article>
        <PageContent initialPage={page as Page} asyncBlocks={asyncBlocks} />
      </article>
    )
  }

  return (
    <article>
      <RenderHero {...page.hero} />
      <RenderBlocks blocks={page.layout} />
    </article>
  )
}
