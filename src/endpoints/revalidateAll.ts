import type { Endpoint } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

import { CACHE_TAGS } from '../lib/cacheTags'

/**
 * Drops every cached CMS query and rendered route.
 *
 * Publishing through the admin already invalidates the collection that
 * changed, so this is the escape hatch for the cases hooks cannot see —
 * chiefly `pnpm sync:prod`, which writes to the database directly.
 *
 * Authorisation is the admin session itself: `req.user` is only set for a
 * signed-in user, which is why this lives here instead of behind the shared
 * secret that `/api/revalidate` uses for scripts.
 */
export const revalidateAll: Endpoint = {
  path: '/revalidate-all',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    for (const tag of Object.values(CACHE_TAGS)) {
      revalidateTag(tag)
    }
    revalidatePath('/', 'layout')

    req.payload.logger.info(`Cache purged by ${req.user.email}`)

    return Response.json({ purged: true, tags: Object.values(CACHE_TAGS) })
  },
}
