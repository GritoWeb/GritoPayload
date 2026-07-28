import type { Metadata } from 'next'
import { PageView, pageMetadata } from '@/components/pages/PageView'

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ slug: 'home', locale: 'en', path: '/en' })
}

export default function Page() {
  return <PageView slug="home" locale="en" />
}
