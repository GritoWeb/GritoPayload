import type { Metadata } from 'next'
import { PostSinglePage, postMetadata } from '@/components/pages/PostSingle'

export const dynamic = 'force-dynamic'

type Args = { params: Promise<{ slug: string }> }

export function generateMetadata(args: Args): Promise<Metadata> {
  return postMetadata(args, 'en')
}

export default function Page(args: Args) {
  return <PostSinglePage {...args} locale="en" />
}
