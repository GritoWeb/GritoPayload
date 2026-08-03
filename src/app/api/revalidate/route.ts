import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// Manual cache purge — escape hatch for cases the admin publish hooks don't
// cover, chiefly `pnpm sync:prod` (which writes D1/R2 directly, bypassing the
// collection afterChange hooks, so nothing gets invalidated automatically).
//
// Auth: send the shared secret via the `x-revalidate-secret` header or a
// `?secret=` query param. Set REVALIDATE_SECRET in the environment.
//
// Usage (against the deployed site):
//   # purge everything
//   curl -X POST "$BASE_URL/api/revalidate?secret=$REVALIDATE_SECRET"
//   # purge one path
//   curl -X POST "$BASE_URL/api/revalidate?secret=…&path=/portfolio/acme"
//   # purge by tag
//   curl -X POST "$BASE_URL/api/revalidate?secret=…&tag=posts-sitemap"
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET
  const provided =
    request.headers.get('x-revalidate-secret') ??
    request.nextUrl.searchParams.get('secret')

  if (!expected || provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const tag = searchParams.get('tag')
  const path = searchParams.get('path')

  if (tag) {
    revalidateTag(tag)
    return NextResponse.json({ revalidated: true, tag })
  }

  if (path) {
    revalidatePath(path)
    return NextResponse.json({ revalidated: true, path })
  }

  // No target given → purge the whole site. Revalidating the root layout
  // cascades to every route beneath it.
  revalidatePath('/', 'layout')
  return NextResponse.json({ revalidated: true, scope: 'all' })
}
