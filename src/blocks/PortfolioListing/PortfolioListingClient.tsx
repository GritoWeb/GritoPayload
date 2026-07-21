'use client'

import React, { useState, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Media } from '@/payload-types'
import { parseTitle } from '@/utilities/parseTitle'
import { titleMaxWidthClass, type TitleMaxWidth } from '@/utilities/titleMaxWidthClass'
import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { AnimatedCard } from '@/components/ui/AnimatedCard'

// ── Types ─────────────────────────────────────────────────────────────────────

export type PortfolioItem = {
  id: string
  title: string
  slug: string
  client?: string | null
  result?: string | null
  tagId?: string | null
  tagLabel?: string | null
  tagVariant?: 'blue' | 'orange'
  accent?: 'blue' | 'orange'
  image?: Media | null
}

export type FilterOption = {
  label: string
  value: string
  slug: string
}

export type PortfolioListingClientProps = {
  portfolios: PortfolioItem[]
  filters: FilterOption[]
  eyebrow?: string | null
  title?: string | null
  titleMaxWidth?: TitleMaxWidth | null
  showFilters: boolean
}

// ── Icons ─────────────────────────────────────────────────────────────────────

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

const accentBg: Record<string, string> = {
  blue: 'bg-blue/8',
  orange: 'bg-orange/10',
}

const tagVariantClasses: Record<string, string> = {
  blue: 'bg-blue/10 text-blue',
  orange: 'bg-orange/15 text-orange-700',
}

function Tag({ children, variant = 'blue' }: { children: React.ReactNode; variant?: 'blue' | 'orange' }) {
  return (
    <span className={`inline-flex lowercase items-center px-2.5 py-[5px] opacity-80 rounded-full font-body text-[0.625rem] font-bold  tracking-[0.04em] ${tagVariantClasses[variant]}`}>
      {children}
    </span>
  )
}

// ── Card component ────────────────────────────────────────────────────────────

export function PortfolioCardGrid({ item }: { item: PortfolioItem }) {
  const imageUrl = item.image?.url ?? null
  const bg = accentBg[item.accent ?? 'blue']

  return (
    <Link
      href={`/portfolio/${item.slug}`}
      className="group h-full flex flex-col rounded-3xl overflow-hidden bg-white border border-line no-underline text-inherit transition-shadow duration-300 motion-reduce:transition-none hover:shadow-[0_6px_15px_rgba(40,40,40,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
    >
      <div className={`h-[200px] flex items-center justify-center overflow-hidden ${bg}`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.image?.alt ?? item.title}
            width={120}
            height={120}
            sizes="120px"
            className="object-cover"
          />
        ) : (
          <span className="font-display font-black text-5xl opacity-10 select-none">
            {item.title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-6 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {item.tagLabel && <Tag variant={item.tagVariant ?? 'blue'}>{item.tagLabel}</Tag>}
        </div>
        {item.client && (
          <p className="m-0 font-display font-bold text-[11px] uppercase tracking-[0.14em] text-orange">
            {item.client}
          </p>
        )}
        <h3 className="m-0 font-display font-bold text-lg text-ink leading-snug">{item.title}</h3>
        {item.result && <p className="m-0 font-body text-sm font-medium text-blue mt-auto">{item.result}</p>}
      </div>
      <div className="px-6 pb-5">
        <span aria-hidden="true" className="inline-flex items-center  gap-1.5 font-display text-sm font-bold text-blue">
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

// ── Filter primitives ─────────────────────────────────────────────────────────

const pillBase = [
  'px-4 py-2 rounded-full font-display font-medium text-sm cursor-pointer border-[1.5px] transition-colors duration-150 motion-reduce:transition-none',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
].join(' ')

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
            className={`${pillBase} ${active
              ? 'bg-orange text-white border-orange'
              : 'bg-transparent text-ink border-line hover:border-blue hover:text-blue'
              }`}
          >
            {opt.label}
          </button>
        )
      })}
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export const PortfolioListingClient: React.FC<PortfolioListingClientProps> = ({
  portfolios,
  filters,
  eyebrow,
  title,
  titleMaxWidth,
  showFilters,
}) => {
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

  const [activeFilter, setActiveFilter] = useState<string>(initialFilter)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const handleFilterChange = (value: string) => {
    setActiveFilter(value)
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

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return portfolios
    return portfolios.filter((p) => p.tagId === activeFilter)
  }, [portfolios, activeFilter])

  return (
    <section className="px-5 py-20">
      <div className="container">
        {/* Header */}
        <div className="mb-10">
          {eyebrow && <p className="font-eyebrow m-0 mb-3">{eyebrow}</p>}
          {title && (
            <h2
              className={[
                'm-0 font-display font-bold text-h2 text-blue leading-tight',
                titleMaxWidthClass(titleMaxWidth),
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {parseTitle(title)}
            </h2>
          )}
        </div>

        {/* Controls bar */}
        {showFilters && (
          <div className="mb-8">
            {/* Desktop: filter pills inline */}
            <div className="hidden md:flex items-center gap-2 flex-wrap" role="group" aria-label="Filtrar por categoria">
              <FilterPills
                filters={filters}
                activeFilter={activeFilter}
                onChange={handleFilterChange}
              />
            </div>

            {/* Mobile: botão "Filtros" recolhível */}
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="portfolio-mobile-filters"
              className="md:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full border-[1.5px] border-blue bg-transparent text-blue font-display font-medium text-sm cursor-pointer transition-colors duration-150 motion-reduce:transition-none hover:bg-blue/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              <FilterIcon />
              Filtros
              <ChevronIcon open={filtersOpen} />
            </button>

            {/* Mobile: painel expansível com os pills */}
            <div
              className={`md:hidden grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${filtersOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="overflow-hidden">
                <div
                  id="portfolio-mobile-filters"
                  className="mt-4 flex flex-wrap gap-2.5 items-center"
                  role="group"
                  aria-label="Filtrar por categoria"
                >
                  <FilterPills
                    filters={filters}
                    activeFilter={activeFilter}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div key={`grid-${activeFilter}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, i) => (
            <AnimatedCard key={item.id} delay={i * 60}>
              <PortfolioCardGrid item={item} />
            </AnimatedCard>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-mute font-display animate-in fade-in duration-300 motion-reduce:animate-none">
            Nenhum projeto encontrado.
          </div>
        )}
      </div>
    </section>
  )
}
