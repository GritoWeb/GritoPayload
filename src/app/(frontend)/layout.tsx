import React from 'react'
import { headers } from 'next/headers'
import { Lato } from 'next/font/google'
import './styles.css'

// Self-hosted at build time and served from our own origin, so the browser never
// has to reach fonts.googleapis.com/fonts.gstatic.com before the first paint.
const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  display: 'swap',
  variable: '--font-lato',
})

export const metadata = {
  title: 'GritoWeb — Agência Digital | WordPress, E-Commerce e UX/UI em Sorocaba',
  description:
    'GritoWeb é um estúdio digital de Itapetininga especializado em WordPress, e-commerce, landing pages, UX/UI e branding.',
  icons: {
    icon: '/favicon.png',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const headersList = await headers()
  const locale = headersList.get('x-locale') ?? 'pt'
  const lang = locale === 'en' ? 'en' : 'pt-BR'

  return (
    <html lang={lang} className={lato.variable}>
      <body className="flex flex-col min-h-screen">
        <noscript>
          <style>{`.fade-in-img{opacity:1 !important;}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  )
}
