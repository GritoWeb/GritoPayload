'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import React, { useState, useEffect } from 'react'

import type { Header } from '@/payload-types'
import type { Page } from '@/payload-types'

interface HeaderClientProps {
  data: Header
  locale: string
}

type NavItem = NonNullable<Header['navItems']>[number]

function resolveHref(link: NavItem['link'], locale: string): string {
  if (link.type === 'reference' && link.reference && typeof link.reference.value === 'object') {
    const slug = (link.reference.value as Page).slug
    return locale === 'en' ? `/en/${slug}` : `/${slug}`
  }
  return link.url ?? '#'
}

const linkBase =
  'no-underline font-body font-bold text-xs uppercase tracking-[0.12em] transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper rounded-sm'

// Orange underline drawn with an ::after pseudo-element. It scales in from the
// left on hover; active items keep it shown by default (see `underlineActive`).
const underlineBase =
  "relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:bg-orange after:rounded-full after:origin-left after:transition-transform after:duration-300 after:ease-out motion-reduce:after:transition-none"
const underlineHover = 'after:scale-x-0 hover:after:scale-x-100'
const underlineActive = 'after:scale-x-100'

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, locale }) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll while menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const navItems = (data?.navItems ?? []).map((item) => ({
    id: item.id ?? item.link.label,
    label: item.link.label,
    href: resolveHref(item.link, locale),
  }))

  const otherLocale = locale === 'pt' ? 'en' : 'pt'

  function switchLocale() {
    if (locale === 'pt') {
      window.location.href = `/en${pathname}`
    } else {
      const rest = pathname.startsWith('/en') ? pathname.slice(3) || '/' : pathname
      window.location.href = rest
    }
  }

  return (
    <header className="bg-paper border-b border-line relative z-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-[22px]">
        <Link
          href={locale === 'en' ? '/en' : '/'}
          aria-label="GritoWeb — home"
          className="no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper rounded-md"
        >
          <Image src="/favicon.png" alt="GritoWeb" width={512} height={512} className="h-11 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7 list-none m-0 p-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`${linkBase} ${underlineBase} ${
                      isActive ? `text-orange ${underlineActive}` : `text-blue hover:text-orange ${underlineHover}`
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
            <li>
              <button
                onClick={switchLocale}
                aria-label={`Switch to ${otherLocale === 'en' ? 'English' : 'Português'}`}
                className={`${linkBase} ${underlineBase} ${underlineHover} text-blue hover:text-orange bg-transparent border-0 cursor-pointer p-0`}
              >
                {otherLocale.toUpperCase()}
              </button>
            </li>
          </ul>
        </nav>

        {/* Hamburger button — mobile only */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 -mr-2 bg-transparent border-0 cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          onClick={() => setIsOpen((o) => !o)}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {/* Three-line icon animating to X */}
          <span className="relative flex flex-col justify-between w-6 h-[14px]">
            <span
              className={`block h-0.5 w-full bg-blue rounded-full transition-all duration-300 ease-in-out origin-center ${
                isOpen ? 'rotate-45 translate-y-[6px]' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-full bg-blue rounded-full transition-all duration-300 ease-in-out ${
                isOpen ? 'opacity-0 scale-x-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-full bg-blue rounded-full transition-all duration-300 ease-in-out origin-center ${
                isOpen ? '-rotate-45 -translate-y-[6px]' : ''
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile menu — grows top-to-bottom; items stagger right→left on open, reverse on close */}
      <nav
        id="mobile-menu"
        aria-label="Mobile primary"
        className={`md:hidden absolute top-full left-0 right-0 bg-paper border-t border-line shadow-lg overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          isOpen ? 'max-h-[400px] pointer-events-auto' : 'max-h-0 pointer-events-none'
        }`}
        style={{ transitionDelay: isOpen ? '0ms' : `${navItems.length * 100}ms` }}
      >
        <ul className="flex flex-col list-none m-0 p-0 px-6 py-5 gap-6">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const openDelay = index * 100
            const closeDelay = (navItems.length - index) * 100
            return (
              <li
                key={item.id}
                className={`transition-all duration-300 ease-out ${
                  isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                }`}
                style={{ transitionDelay: `${isOpen ? openDelay : closeDelay}ms` }}
              >
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`${linkBase} block ${isActive ? 'text-orange' : 'text-blue hover:text-orange'}`}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
          <li
            className={`transition-all duration-300 ease-out ${
              isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
            style={{ transitionDelay: `${isOpen ? navItems.length * 100 : 0}ms` }}
          >
            <button
              onClick={switchLocale}
              aria-label={`Switch to ${otherLocale === 'en' ? 'English' : 'Português'}`}
              className={`${linkBase} text-blue hover:text-orange bg-transparent border-0 cursor-pointer p-0`}
            >
              {otherLocale.toUpperCase()}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  )
}
