// UI copy for the blog post page, keyed by locale. The locale set is defined by
// these keys.

export type PostLocale = 'pt' | 'en'

export const strings = {
  pt: {
    aboutAuthor: 'Sobre o autor',
    tags: 'Tags',
    keepReading: 'Continue lendo',
    relatedPosts: 'Posts relacionados',
    viewAll: 'Ver todos os posts',
  },
  en: {
    aboutAuthor: 'About the author',
    tags: 'Tags',
    keepReading: 'Keep reading',
    relatedPosts: 'Related posts',
    viewAll: 'View all posts',
  },
} as const

// Locale-derived values: date formatting locale and the URL prefixes.
// pt is prefix-less (route group); en carries /en.
export const dateLocale = (locale: PostLocale) => (locale === 'en' ? 'en-US' : 'pt-BR')
export const blogBase = (locale: PostLocale) => (locale === 'en' ? '/en/blog' : '/blog')
export const postsBase = (locale: PostLocale) => (locale === 'en' ? '/en/posts' : '/posts')
