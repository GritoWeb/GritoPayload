import type { Block } from 'payload'

import { titleMaxWidth } from '../../fields/titleMaxWidth'

export const LatestPosts: Block = {
  slug: 'latestPosts',
  interfaceName: 'LatestPostsBlock',
  labels: { singular: 'Latest Posts', plural: 'Latest Posts' },
  fields: [
    {
      name: 'eyebrow',
      label: 'Eyebrow',
      type: 'text',
      localized: true,
      defaultValue: 'Blog',
    },
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      localized: true,
      defaultValue: '*Últimos posts* do blog',
      admin: { description: 'Use *word* for orange. Use \\n for line break.' },
    },
    titleMaxWidth,
    {
      name: 'buttonLabel',
      label: 'Button — text',
      type: 'text',
      localized: true,
      defaultValue: 'Ver todos os posts',
    },
    {
      name: 'buttonHref',
      label: 'Button — link',
      type: 'text',
      defaultValue: '/posts',
    },
  ],
}
