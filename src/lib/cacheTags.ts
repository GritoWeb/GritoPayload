// Shared cache-tag vocabulary for the Next data cache (unstable_cache).
//
// Server components that query D1 at render time (single docs + listing blocks)
// wrap those queries in `unstable_cache` tagged with the collection name below.
// The collection revalidate hooks call `revalidateTag(<name>)` on publish/delete
// so the cached query results are dropped and re-fetched on the next request.
//
// Tags are collection-wide (not per-slug) on purpose: content volume is low, so
// invalidating a whole collection's cached queries on one edit is cheap and keeps
// the hook logic bulletproof (no per-locale slug matching to get wrong).
export const CACHE_TAGS = {
  pages: 'pages',
  posts: 'posts',
  portfolios: 'portfolios',
  portfolioTags: 'portfolio-tags',
  tags: 'tags',
} as const

// Backstop TTL (seconds) for every cached query. On-demand tag invalidation is the
// primary freshness path (instant on admin publish); this ceiling self-heals content
// pushed by `pnpm sync:prod`, which writes D1 directly and bypasses the hooks.
export const CACHE_TTL = 3600
