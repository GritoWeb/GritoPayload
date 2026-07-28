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

    // ── Intro ─────────────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Intro',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'introLayout',
          label: 'Layout',
          type: 'select',
          defaultValue: 'two',
          options: [
            { label: 'Two columns (eyebrow + title left, body right)', value: 'two' },
            { label: 'Single column', value: 'one' },
          ],
        },
        {
          name: 'introEyebrow',
          label: 'Eyebrow',
          type: 'text',
          localized: true,
          admin: { description: 'Small label above the title. Leave empty to hide.' },
        },
        {
          name: 'introTitle',
          label: 'Title',
          type: 'text',
          admin: { description: 'Use *word* for orange.' },
        },
        {
          name: 'introBody',
          label: 'Body',
          type: 'richText',
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
              FixedToolbarFeature(),
              InlineToolbarFeature(),
              HorizontalRuleFeature(),
            ],
          }),
        },
      ],
    },

    // ── Process ───────────────────────────────────────────────────────────
    {
      name: 'processSteps',
      label: 'Process',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'number',
          label: 'Number',
          type: 'text',
          admin: { description: 'Ex: 01' },
        },
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
        },
      ],
    },

    // ── Gallery ───────────────────────────────────────────────────────────
    {
      name: 'gallery',
      label: 'Gallery',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'image',
          label: 'Image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'label',
          label: 'Caption',
          type: 'text',
        },
        {
          name: 'accent',
          label: 'Background color (fallback)',
          type: 'select',
          options: [
            { label: 'Blue', value: 'blue' },
            { label: 'Orange', value: 'orange' },
          ],
          defaultValue: 'blue',
        },
      ],
    },

    // ── Client quote ──────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Client quote',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'quoteHighlight',
          label: 'Highlight sentence',
          type: 'textarea',
          admin: { description: 'The strong lead sentence, rendered large. Leave empty to skip.' },
        },
        {
          name: 'quoteText',
          label: 'Quote',
          type: 'textarea',
          admin: { description: 'The testimonial body, always at reading size.' },
        },
        {
          name: 'quoteAuthor',
          label: 'Author',
          type: 'text',
        },
        {
          name: 'quoteRole',
          label: 'Role / company',
          type: 'text',
        },
      ],
    },

    // ── Results / stats ───────────────────────────────────────────────────
    {
      name: 'stats',
      label: 'Results (numbers)',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'value',
          label: 'Value',
          type: 'text',
          admin: { description: 'Ex: +38%' },
        },
        {
          name: 'label',
          label: 'Description',
          type: 'text',
          admin: { description: 'Ex: Average ticket after redesign' },
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
