import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { revalidatePortfolio, revalidatePortfolioDelete } from './hooks/revalidatePortfolio'

export const Portfolios: CollectionConfig<'portfolios'> = {
  slug: 'portfolios',
  labels: { singular: 'Portfolio', plural: 'Portfolios' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    client: true,
    image: true,
    tag: true,
    tagVariant: true,
    accent: true,
    result: true,
    summary: true,
  },
  admin: {
    group: 'Portfolio',
    defaultColumns: ['title', 'client', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    // ── Hero ──────────────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Hero',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'title',
          label: 'Project title',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'client',
          label: 'Company / client name',
          type: 'text',
          required: true,
        },
        {
          name: 'summary',
          label: 'Summary (hero subtitle)',
          type: 'textarea',
          localized: true,
          admin: { description: 'Appears below the title on the case page.' },
        },
        {
          name: 'image',
          label: 'Cover image (hero)',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },

    // ── Listing card ──────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Listing card',
      admin: {
        initCollapsed: false,
        description: 'How this project appears in the /portfolio grid.',
      },
      fields: [
        {
          name: 'tag',
          label: 'Card tag',
          type: 'relationship',
          relationTo: 'portfolio-tags',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'tagVariant',
              label: 'Tag color',
              type: 'select',
              options: [
                { label: 'Blue', value: 'blue' },
                { label: 'Orange', value: 'orange' },
              ],
              defaultValue: 'blue',
            },
            {
              name: 'accent',
              label: 'Card color',
              type: 'select',
              options: [
                { label: 'Blue', value: 'blue' },
                { label: 'Orange', value: 'orange' },
              ],
              defaultValue: 'blue',
            },
          ],
        },
        {
          name: 'result',
          label: 'Featured result (card)',
          type: 'text',
          admin: { description: 'Shown on the listing card. Ex: +38% average ticket' },
        },
      ],
    },

    // ── Meta strip ────────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Meta strip',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'sector',
          label: 'Sector',
          type: 'text',
        },
        {
          name: 'deliverables',
          label: 'Deliverables',
          type: 'text',
          admin: { description: 'Ex: Site, POS, Reservations' },
        },
        {
          name: 'duration',
          label: 'Duration',
          type: 'text',
          admin: { description: 'Ex: 10 weeks' },
        },
        {
          name: 'since',
          label: 'Since / year',
          type: 'text',
          admin: { description: 'Ex: 2021 — shown as "Desde" in the facts rail.' },
        },
      ],
    },

    // ── Case content ──────────────────────────────────────────────────────
    // Repeatable layout for the case body. Mirrors the block structure the
    // production database already stores under the `content` path.
    {
      name: 'content',
      label: 'Case content',
      type: 'blocks',
      admin: {
        description: 'Build the case body by stacking blocks in the order they should read.',
      },
      blocks: [
        {
          slug: 'caseText',
          labels: { singular: 'Text', plural: 'Text blocks' },
          fields: [
            {
              name: 'layout',
              label: 'Layout',
              type: 'select',
              defaultValue: 'two',
              options: [
                { label: 'Two columns (eyebrow + title left, body right)', value: 'two' },
                { label: 'Single column', value: 'one' },
              ],
            },
            { name: 'eyebrow', label: 'Eyebrow', type: 'text', localized: true },
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              localized: true,
              admin: { description: 'Wrap a word in *asterisks* to accent it.' },
            },
            { name: 'body', label: 'Body', type: 'richText', localized: true },
          ],
        },
        {
          slug: 'caseTimeline',
          labels: { singular: 'Timeline', plural: 'Timelines' },
          fields: [
            {
              name: 'steps',
              label: 'Steps',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [
                { name: 'number', label: 'Number', type: 'text', admin: { description: 'Ex: 01' } },
                { name: 'title', label: 'Title', type: 'text', localized: true },
                { name: 'description', label: 'Description', type: 'textarea', localized: true },
              ],
            },
          ],
        },
        {
          slug: 'caseGallery',
          labels: { singular: 'Gallery', plural: 'Galleries' },
          fields: [
            {
              name: 'items',
              label: 'Images',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [
                { name: 'image', label: 'Image', type: 'upload', relationTo: 'media' },
                { name: 'label', label: 'Caption', type: 'text', localized: true },
                {
                  name: 'accent',
                  label: 'Accent',
                  type: 'select',
                  defaultValue: 'blue',
                  options: [
                    { label: 'Blue', value: 'blue' },
                    { label: 'Orange', value: 'orange' },
                  ],
                },
              ],
            },
          ],
        },
        {
          slug: 'caseQuote',
          labels: { singular: 'Client quote', plural: 'Client quotes' },
          fields: [
            {
              name: 'highlight',
              label: 'Highlight sentence',
              type: 'textarea',
              localized: true,
              admin: { description: 'The strong lead sentence, rendered large. Leave empty to skip.' },
            },
            {
              name: 'text',
              label: 'Quote',
              type: 'textarea',
              localized: true,
              admin: { description: 'The testimonial body, always at reading size.' },
            },
            { name: 'author', label: 'Author', type: 'text' },
            { name: 'role', label: 'Role / company', type: 'text' },
          ],
        },
        {
          slug: 'caseStats',
          labels: { singular: 'Results (numbers)', plural: 'Results (numbers)' },
          fields: [
            {
              name: 'stats',
              label: 'Numbers',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [
                { name: 'value', label: 'Value', type: 'text', admin: { description: 'Ex: 90+' } },
                { name: 'label', label: 'Label', type: 'text', localized: true },
              ],
            },
          ],
        },
      ],
    },
    // ── Stack ─────────────────────────────────────────────────────────────
    {
      name: 'stack',
      label: 'Stack / tooling',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'tool',
          label: 'Tool',
          type: 'text',
        },
      ],
    },

    // ── Related projects ──────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Related projects',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'relatedPortfolios',
          label: 'Related projects',
          type: 'relationship',
          relationTo: 'portfolios',
          hasMany: true,
          maxRows: 3,
          filterOptions: ({ id }) => ({ id: { not_in: [id] } }),
        },
      ],
    },

    // ── Publishing (sidebar) ──────────────────────────────────────────────
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar' },
    },
    slugField(),
  ],
  hooks: {
    beforeChange: [populatePublishedAt],
    afterChange: [revalidatePortfolio],
    afterDelete: [revalidatePortfolioDelete],
  },
  versions: {
    drafts: {
      autosave: { interval: 100 },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
