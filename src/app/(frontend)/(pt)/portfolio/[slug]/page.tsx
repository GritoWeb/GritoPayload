import type { Metadata } from 'next'
import { PortfolioCasePage, portfolioMetadata } from '@/components/pages/PortfolioCase'

type Args = { params: Promise<{ slug: string }> }

export function generateMetadata(args: Args): Promise<Metadata> {
  return portfolioMetadata(args, 'pt')
}

export default function Page(args: Args) {
  return <PortfolioCasePage {...args} locale="pt" />
}
