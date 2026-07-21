import type { Block } from 'payload'

import { titleMaxWidth } from '../../fields/titleMaxWidth'

export const PortfolioListing: Block = {
  slug: 'portfolioListing',
  interfaceName: 'PortfolioListingBlock',
  labels: { singular: 'Portfolio Listing', plural: 'Portfolio Listings' },
  fields: [
    {
      name: 'eyebrow',
      label: 'Eyebrow',
      type: 'text',
      localized: true,
      defaultValue: 'Portfólio',
    },
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      localized: true,
      defaultValue: '*Projetos* que colocamos pra rodar',
      admin: { description: 'Use *word* for orange. Use \\n for line break.' },
    },
    titleMaxWidth,
    {
      name: 'showFilters',
      label: 'Show category filters',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
