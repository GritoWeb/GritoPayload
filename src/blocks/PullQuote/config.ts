import type { Block } from 'payload'

export const PullQuote: Block = {
  slug: 'pullQuote',
  interfaceName: 'PullQuoteBlock',
  labels: { singular: 'Pull Quote', plural: 'Pull Quotes' },
  imageURL: '/images/blocks/pullQuote.png',
  imageAltText: 'Pull Quote',
  fields: [
    {
      name: 'eyebrow',
      label: 'Eyebrow',
      type: 'text',
      localized: true,
    },
    {
      name: 'quote',
      label: 'Quote',
      type: 'textarea',
      localized: true,
      required: true,
    },
    {
      name: 'body',
      label: 'Body (optional)',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Paragraphs below the quote. Leave a blank line between paragraphs.',
      },
    },
    {
      name: 'author',
      label: 'Author name',
      type: 'text',
      localized: true,
    },
    {
      name: 'role',
      label: 'Role / Company',
      type: 'text',
      localized: true,
    },
  ],
}
