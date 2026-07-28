import React, { cache } from 'react'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { Metadata } from 'next'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { buildAsyncBlocks } from '@/blocks/buildAsyncBlocks'
import { generateMeta } from '@/utilities/generateMeta'
import { PageContent } from '@/components/PageContent'
import type { Page } from '@/payload-types'

// Shared body for both the home page (slug "home") and every generic CMS page
// (slug from the route param). They render identically — hero + blocks, or the
// live-preview PageContent under draft mode — so the only per-route inputs are
// the slug, the locale, and the canonical path for metadata.

export type PageLocale = 'pt' | 'en'

// Cached raw doc — shared by the page AND its metadata so we hit D1 only once.
const queryPageBySlug = cache(
  async ({ slug, locale, draft }: { slug: string; locale: PageLocale; draft: boolean }) => {
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
