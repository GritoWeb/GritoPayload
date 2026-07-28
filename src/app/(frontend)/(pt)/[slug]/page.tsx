import type { Metadata } from 'next'
import { PageView, pageMetadata } from '@/components/pages/PageView'

type Args = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  return pageMetadata({ slug: decodedSlug, locale: 'pt', path: `/${decodedSlug}` })
}

export default async function Page({ params }: Args) {
  const { slug } = await params
  return <PageView slug={decodeURIComponent(slug)} locale="pt" />
}
