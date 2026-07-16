import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

import type { Footer, Header } from '@/payload-types'
import type { Page } from '@/payload-types'

const services = [
  { label: 'WordPress sob medida', href: '#' },
  { label: 'E-Commerce', href: '#' },
  { label: 'Landing Pages', href: '#' },
  { label: 'UX/UI Design', href: '#' },
  { label: 'Branding', href: '#' },
  { label: 'Digital Solutions', href: '#' },
]

const policies = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Use', href: '#' },
  { label: 'Cookies & LGPD', href: '#' },
]

const socials = [
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 10v8M8 7v.01M12 18v-5a3 3 0 0 1 6 0v5" />
      </svg>
    ),
  },
  {
    label: 'Behance',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h6a3 3 0 0 1 0 6H3zM3 12h7a3 3 0 0 1 0 6H3zM15 8h6M14 14h7a3 3 0 0 0-6 0v0a3 3 0 0 0 6 0" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5a3 3 0 0 0-.9-2.3c3-.3 6.1-1.5 6.1-6.6a5.1 5.1 0 0 0-1.5-3.5 4.7 4.7 0 0 0-.1-3.5s-1.1-.3-3.5 1.4a12 12 0 0 0-6.4 0C6.3 1 5.2 1.3 5.2 1.3A4.7 4.7 0 0 0 5.1 4.8 5.1 5.1 0 0 0 3.6 8.3c0 5.1 3.1 6.3 6.1 6.6a3 3 0 0 0-.9 2.3V21" />
      </svg>
    ),
  },
]

const contact = {
  email: 'contato@gritoweb.com',
  emailHref: 'mailto:contato@gritoweb.com',
  phone: '(15) 99739-4486',
  phoneHref: 'tel:+5515997394486',
  address: 'Sorocaba, SP — Brasil',
  hours: 'Seg–Sex · 09h–18h',
}

const description =
  'Digital studio specializing in WordPress, e-commerce and custom web products. Sorocaba, SP — since 2017.'

const copyright = '© 2026 GritoWeb · CNPJ 27.467.329/0001-13 · All rights reserved.'

const columnTitleClasses =
  'font-display font-bold text-xs uppercase tracking-[0.12em] text-orange m-0'

const linkClasses =
  'no-underline font-body text-sm text-white/80 transition-colors duration-150 motion-reduce:transition-none hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-blue rounded-sm'

const listClasses = 'list-none p-0 m-0 mt-5 flex flex-col gap-2.5'

type HeaderNavItem = NonNullable<Header['navItems']>[number]

function resolveHref(link: HeaderNavItem['link'], locale: string): string {
  if (link.type === 'reference' && link.reference && typeof link.reference.value === 'object') {
    const slug = (link.reference.value as Page).slug
    return locale === 'en' ? `/en/${slug}` : `/${slug}`
  }
  return link.url ?? '#'
}

function LinkColumn({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  const visibleItems = items.filter((item) => item.href !== '#')
  if (visibleItems.length === 0) return null
  return (
    <nav aria-label={title}>
      <h3 className={columnTitleClasses}>{title}</h3>
      <ul className={listClasses}>
        {visibleItems.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className={linkClasses}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export async function FooterComponent({ locale = 'pt' }: { locale?: string }) {
  const headerData: Header = await getCachedGlobal('header', 1, locale)()
  const nav = (headerData?.navItems ?? []).map((item) => ({
    label: item.link.label,
    href: resolveHref(item.link, locale),
  }))

  return (
    <footer className="bg-blue text-white mt-auto">
      <div className="container px-6 pt-18 pb-7">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 items-start">
          <div>
            <div>
              <Image src="/balao-branco.png" alt="GritoWeb" width={160} height={200} className="h-11 w-auto" />
            </div>

            <p className="text-white/70 text-sm mt-5 max-w-[20rem] leading-relaxed">
              {description}
            </p>

            {socials.some((s) => s.href !== '#') && (
              <ul className="flex gap-2.5 mt-6 list-none p-0 m-0">
                {socials.filter((s) => s.href !== '#').map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      aria-label={social.label}
                      className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/20 text-white no-underline transition-colors duration-150 motion-reduce:transition-none hover:bg-white/10 hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-blue"
                    >
                      {social.icon}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <LinkColumn title="Navigation" items={nav} />
          <LinkColumn title="Services" items={services} />

          <div>
            <h3 className={columnTitleClasses}>Contact</h3>
            <address className={`${listClasses} not-italic`}>
              <a href={contact.emailHref} className={linkClasses}>
                {contact.email}
              </a>
              <a href={contact.phoneHref} className={linkClasses}>
                {contact.phone}
              </a>
              <span className="font-body text-sm text-white/55 mt-1.5">{contact.address}</span>
              <span className="font-body text-sm text-white/55">{contact.hours}</span>
            </address>
          </div>
        </div>

        <hr className="border-0 border-t border-white/15 mt-14 mb-6" />

        <div className="flex items-center justify-between flex-wrap gap-4">
          <small className="font-body text-xs text-white/60 tracking-tight">{copyright}</small>
          {policies.some((p) => p.href !== '#') && (
            <ul className="flex items-center gap-5 list-none p-0 m-0 flex-wrap">
              {policies.filter((p) => p.href !== '#').map((policy, index) => (
                <li key={policy.label} className="flex items-center gap-5">
                  {index > 0 && (
                    <span aria-hidden="true" className="text-white/25 text-xs">·</span>
                  )}
                  <Link href={policy.href} className={`${linkClasses} text-xs`}>
                    {policy.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}
