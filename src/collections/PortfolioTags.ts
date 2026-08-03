import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { revalidateTag } from 'next/cache'
import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'
import { CACHE_TAGS } from '../lib/cacheTags'

// Portfolio tags feed the cached portfolio listing (filters). Drop that cache when
// a tag changes so labels/slugs stay fresh.
const revalidatePortfolioTagsCache = () => {
  revalidateTag(CACHE_TAGS.portfolioTags)
  revalidateTag(CACHE_TAGS.portfolios)
}

export const PortfolioTags: CollectionConfig = {
  slug: 'portfolio-tags',
  labels: { singular: 'Portfolio Tag', plural: 'Portfolio Tags' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    afterChange: [({ req: { context } }) => void (!context.disableRevalidate && revalidatePortfolioTagsCache())],
    afterDelete: [({ req: { context } }) => void (!context.disableRevalidate && revalidatePortfolioTagsCache())],
  },
  admin: {
    group: 'Portfolio',
    defaultColumns: ['title', 'slug'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
    },
    slugField(),
  ],
}
