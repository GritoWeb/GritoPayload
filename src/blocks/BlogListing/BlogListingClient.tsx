'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Media } from '@/payload-types'
import { parseTitle } from '@/utilities/parseTitle'
import { titleMaxWidthClass, type TitleMaxWidth } from '@/utilities/titleMaxWidthClass'
import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { AnimatedCard } from '@/components/ui/AnimatedCard'

// ── Types ─────────────────────────────────────────────────────────────────────

export type PostItem = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  date?: string | null
  categoryId?: string | null
  categoryLabel?: string | null
  image?: Media | null
}

export type FeaturedPostItem = PostItem

export type FilterOption = {
  label: string
  value: string
  slug: string
}

export type BlogListingClientProps = {
  posts: PostItem[]
  filters: FilterOption[]
  featuredPost?: FeaturedPostItem | null
  eyebrow?: string | null
  title?: string | null
  titleMaxWidth?: TitleMaxWidth | null
  postsPerPage: number
  showSearch: boolean
  showFilters: boolean
  locale: 'pt' | 'en'
}

// Cap on how many FTS matches we pull per query; client paginates/filters over them.
const SEARCH_LIMIT = 100
const SEARCH_DEBOUNCE_MS = 280

// ── SVG helpers ───────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
)

const FilterIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 5h18M6 12h12M10 19h4" />
  </svg>
)

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={`transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
)

// ── Primitives ────────────────────────────────────────────────────────────────

const filterPillBase = [
  'px-4 py-2 rounded-full font-display font-medium text-sm cursor-pointer',
  'border-[1.5px] transition-colors duration-150 motion-reduce:transition-none',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
].join(' ')

const tagBase =
  'inline-flex items-center px-[10px] py-[5px] rounded-full font-body text-[10px] font-bold lowercase tracking-[0.04em] opacity-80'

const accentBg = ['bg-blue/8', 'bg-orange/10']

// ── Sub-components ────────────────────────────────────────────────────────────

function Tag({ children, index }: { children: React.ReactNode; index: number }) {
  const variant = index % 2 === 0 ? 'bg-blue/10 text-blue' : 'bg-orange/15 text-orange-700'
  return <span className={`${tagBase} ${variant}`}>{children}</span>
}

export function PostCard({
  post,
  index,
  locale,
}: {
  post: PostItem
  index: number
  locale?: 'pt' | 'en'
}) {
  const image = post.image
  const imageUrl =
    image && typeof image === 'object' && image.url ? image.url : null
  const hrefPrefix = locale === 'en' ? '/en' : ''

  return (
    <Link
      href={`${hrefPrefix}/posts/${post.slug}`}
      className="group h-full flex flex-col rounded-3xl overflow-hidden bg-white border border-line no-underline text-inherit transition-shadow duration-300 motion-reduce:transition-none hover:shadow-[0_6px_15px_rgba(40,40,40,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
    >
      <div className={`h-[200px] flex items-center justify-center overflow-hidden ${accentBg[index % 2]}`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={image?.alt ?? post.title ?? ''}
            width={600}
            height={200}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
            className="w-full h-full max-w-[120px] max-h-[120px] object-cover"
          />
        ) : (
          <span className="font-display font-black text-5xl opacity-10 select-none">
            {(post.title ?? '').charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="px-6 pt-5 pb-6 flex flex-col gap-2.5 flex-1">
        <div className="flex items-center gap-2.5">
          {post.categoryLabel && <Tag index={index}>{post.categoryLabel}</Tag>}
        </div>
        <h3 className="m-0 font-bold text-[22px] leading-tight">{post.title}</h3>
        {post.excerpt && <p className="m-0 text-sm text-mute line-clamp-3">{post.excerpt}</p>}
        <span aria-hidden="true" className="mt-auto pt-2 font-display font-bold text-sm text-blue inline-flex items-center gap-1.5">
          Ler mais
          <ArrowIcon
            size={24}
            className="transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transform-none"
          />
        </span>
      </div>
    </Link>
  )
}

// ── FeaturedPostBanner ────────────────────────────────────────────────────────

function FeaturedPostBanner({ post, locale }: { post: FeaturedPostItem; locale?: 'pt' | 'en' }) {
  const imageUrl =
    post.image && typeof post.image === 'object' && post.image.url ? post.image.url : null
  const hrefPrefix = locale === 'en' ? '/en' : ''

  const formattedDate = post.date
    ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(
      new Date(post.date),
    )
    : null

  return (
    <article className="container mb-14">
      <Link
        href={`${hrefPrefix}/posts/${post.slug}`}
        className="group grid grid-cols-1 md:grid-cols-[1.15fr_1fr] bg-white rounded-[28px] overflow-hidden border border-line no-underline text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        <div className="relative bg-blue text-white p-5 lg:p-12 flex flex-col justify-center min-h-[380px]">

          <h2 className="m-0 mt-4 font-display font-bold text-white text-[44px] leading-[1.1]">
            {post.title}
          </h2>
          {post.excerpt && <p className="mt-4 max-w-xl text-white/85">{post.excerpt}</p>}
          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-white/90">
            {post.categoryLabel && (
              <span className="inline-flex lowercase items-center px-2.5 py-[5px] opacity-80 rounded-full font-body text-[0.625rem] font-bold  tracking-[0.04em] bg-orange text-white">
                {post.categoryLabel}
              </span>
            )}
          </div>
          <div className="mt-7">
            <span className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-orange text-white font-display font-bold text-sm">
              Ler o post
              <ArrowIcon
                size={24}
                className="transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transform-none"
              />
            </span>
          </div>
        </div>
        <div className="bg-paper-dim flex items-center justify-center p-10 relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={post.image?.alt ?? post.title ?? ''}
              width={400}
              height={360}
              sizes="(max-width: 768px) 100vw, 40vw"
              className="w-full h-auto object-contain max-h-[320px]"
            />
          ) : (
            <span className="font-display font-black text-[8rem] text-blue/10 select-none">
              {(post.title ?? '').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </Link>
    </article>
  )
}

// ── Filter primitives (shared desktop / mobile) ────────────────────────────────

function SearchField({
  value,
  onChange,
  wrapperClassName,
}: {
  value: string
  onChange: (value: string) => void
  wrapperClassName?: string
}) {
  return (
    <div className={`relative ${wrapperClassName ?? ''}`}>
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mute pointer-events-none">
        <SearchIcon />
      </span>
      <input
        type="search"
        aria-label="Buscar posts"
        placeholder="Buscar no blog…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-[280px] py-3 pl-11 pr-5 rounded-full border-[1.5px] border-line bg-white font-body text-sm text-ink placeholder:text-mute focus:outline-none focus:border-blue transition-colors duration-150 motion-reduce:transition-none"
      />
    </div>
  )
}

function FilterPills({
  filters,
  activeFilter,
  onChange,
}: {
  filters: FilterOption[]
  activeFilter: string
  onChange: (value: string) => void
}) {
  return (
    <>
      {[{ label: 'Todos', value: 'all' }, ...filters].map((opt) => {
        const active = opt.value === activeFilter
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`${filterPillBase} ${active
              ? 'bg-blue text-white border-transparent'
              : 'bg-transparent text-blue border-blue hover:bg-blue/5'
              }`}
          >
            {opt.label}
          </button>
        )
      })}
    </>
  )
}

// ── Main client component ─────────────────────────────────────────────────────

export function BlogListingClient({
  posts,
  filters,
  featuredPost,
  eyebrow,
  title,
  titleMaxWidth,
  postsPerPage,
  showSearch,
  showFilters,
  locale,
}: BlogListingClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const initialFilter = useMemo(() => {
    const tagSlug = searchParams.get('tag')
    if (!tagSlug) return 'all'
    const match = filters.find((f) => f.slug === tagSlug)
    return match ? match.value : 'all'
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState(initialFilter)
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<PostItem[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  // Search-as-you-type → debounced call to the FTS5 endpoint. Text matching happens
  // server-side; category filtering + pagination stay client-side over the results.
  useEffect(() => {
    const q = search.trim()
    if (!q) {
      setSearchResults(null)
      setSearchLoading(false)
      return
    }

    setSearchLoading(true)
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&locale=${locale}&limit=${SEARCH_LIMIT}`,
          { signal: controller.signal },
        )
        if (!res.ok) throw new Error(`search failed: ${res.status}`)
        const data = (await res.json()) as { docs: PostItem[] }
        setSearchResults(data.docs ?? [])
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [search, locale])

  const isSearching = search.trim().length > 0
  const source = searchResults ?? posts

  const filtered = useMemo(() => {
    return source.filter((p) => activeFilter === 'all' || p.categoryId === activeFilter)
  }, [source, activeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / postsPerPage))
  const safePage = Math.min(page, totalPages)
  const slice = filtered.slice((safePage - 1) * postsPerPage, safePage * postsPerPage)

  const handleFilterChange = (value: string) => {
    setActiveFilter(value)
    setPage(1)
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('tag')
    } else {
      const match = filters.find((f) => f.value === value)
      if (match) params.set('tag', match.slug)
    }
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const buildPages = (): (number | '…')[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '…')[] = [1]
    if (safePage > 3) pages.push('…')
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
      pages.push(i)
    }
    if (safePage < totalPages - 2) pages.push('…')
    pages.push(totalPages)
    return pages
  }

  return (
    <section className="px-5 !pt-0 py-24">
      <div className="container">
        {featuredPost && <FeaturedPostBanner post={featuredPost} locale={locale} />}

        <div className="flex items-baseline justify-between gap-6 flex-wrap mb-6">
          <header className="flex flex-col gap-3 max-w-3xl">
            {eyebrow && <p className="font-eyebrow m-0">{eyebrow}</p>}
            <h2
              className={['m-0 text-blue', titleMaxWidthClass(titleMaxWidth)]
                .filter(Boolean)
                .join(' ')}
            >
              {parseTitle(title)}
            </h2>
          </header>

          {showSearch && (
            <SearchField
              value={search}
              onChange={handleSearch}
              wrapperClassName="hidden md:inline-flex"
            />
          )}
        </div>

        {/* Desktop: label "Filtrar por" + pills inline */}
        {showFilters && filters.length > 0 && (
          <div
            className="hidden md:block pb-7 mb-7 border-b border-dashed border-line"
            role="group"
            aria-label="Filtrar por categoria"
          >
            <div className="flex flex-wrap gap-2.5 items-center">
              <span className="font-body font-bold text-xs uppercase tracking-[0.12em] text-mute mr-2">
                Filtrar por
              </span>
              <FilterPills
                filters={filters}
                activeFilter={activeFilter}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        )}

        {/* Mobile: botão "Filtros" que expande busca + pills */}
        {(showSearch || (showFilters && filters.length > 0)) && (
          <div className="md:hidden pb-7 mb-7 border-b border-dashed border-line">
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="blog-mobile-filters"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-[1.5px] border-blue bg-transparent text-blue font-display font-medium text-sm cursor-pointer transition-colors duration-150 motion-reduce:transition-none hover:bg-blue/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              <FilterIcon />
              Filtros
              <ChevronIcon open={filtersOpen} />
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${filtersOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="overflow-hidden">
                <div
                  id="blog-mobile-filters"
                  className="mt-4 flex flex-col gap-4"
                >
                  {showSearch && <SearchField value={search} onChange={handleSearch} />}
                  {showFilters && filters.length > 0 && (
                    <div
                      className="flex flex-wrap gap-2.5 items-center"
                      role="group"
                      aria-label="Filtrar por categoria"
                    >
                      <FilterPills
                        filters={filters}
                        activeFilter={activeFilter}
                        onChange={handleFilterChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {slice.length > 0 ? (
          <div key={`${activeFilter}-${safePage}`} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {slice.map((post, i) => (
              <AnimatedCard key={post.id} delay={i * 60}>
                <PostCard post={post} index={(safePage - 1) * postsPerPage + i} locale={locale} />
              </AnimatedCard>
            ))}
          </div>
        ) : (
          <p className="text-center text-mute py-20 animate-in fade-in duration-300 motion-reduce:animate-none">
            {isSearching && searchLoading ? 'Buscando…' : 'Nenhum post encontrado.'}
          </p>
        )}

        {totalPages > 1 && (
          <nav aria-label="Paginação" className="mt-12 flex justify-center items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label="Página anterior"
              className="h-10 w-10 inline-flex items-center justify-center rounded-full font-display font-medium cursor-pointer transition-colors duration-150 motion-reduce:transition-none bg-transparent text-blue border-[1.5px] border-line hover:border-blue disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              <ArrowIcon size={24} direction="left" />
            </button>

            {buildPages().map((p, i) =>
              p === '…' ? (
                <span key={`ellipsis-${i}`} className="h-10 w-10 inline-flex items-center justify-center text-mute">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p as number)}
                  aria-current={p === safePage ? 'page' : undefined}
                  className={`h-10 w-10 inline-flex items-center justify-center rounded-full font-display font-medium cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${p === safePage
                    ? 'bg-blue text-white border-0'
                    : 'bg-transparent text-blue border-[1.5px] border-line hover:border-blue'
                    }`}
                >
                  {p}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label="Próxima página"
              className="h-10 w-10 inline-flex items-center justify-center rounded-full font-display font-medium cursor-pointer transition-colors duration-150 motion-reduce:transition-none bg-transparent text-blue border-[1.5px] border-line hover:border-blue disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              <ArrowIcon size={24} />
            </button>
          </nav>
        )}
      </div>
    </section>
  )
}
