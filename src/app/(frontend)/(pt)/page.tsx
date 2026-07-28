import type { Metadata } from 'next'
import { PageView, pageMetadata } from '@/components/pages/PageView'

export const dynamic = 'force-dynamic'

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ slug: 'home', locale: 'pt', path: '/' })
}

export default function Page() {
  return <PageView slug="home" locale="pt" />
}
