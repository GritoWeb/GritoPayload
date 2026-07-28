import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { revalidateTag } from 'next/cache'
import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'
import { CACHE_TAGS } from '../lib/cacheTags'

// Blog categories feed the cached posts listing (filters). Drop that cache when a
// tag changes so labels/slugs stay fresh.
const revalidateTagsCache = () => {
  revalidateTag(CACHE_TAGS.tags)
  revalidateTag(CACHE_TAGS.posts)
}

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: { singular: 'Tag', plural: 'Tags' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    afterChange: [({ req: { context } }) => void (!context.disableRevalidate && revalidateTagsCache())],
    afterDelete: [({ req: { context } }) => void (!context.disableRevalidate && revalidateTagsCache())],
  },
  admin: {
    group: 'Blog',
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
