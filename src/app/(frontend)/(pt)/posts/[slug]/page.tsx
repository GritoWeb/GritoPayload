import type { Metadata } from 'next'
import { PostSinglePage, postMetadata } from '@/components/pages/PostSingle'

type Args = { params: Promise<{ slug: string }> }

export function generateMetadata(args: Args): Promise<Metadata> {
  return postMetadata(args, 'pt')
}

export default function Page(args: Args) {
  return <PostSinglePage {...args} locale="pt" />
}
