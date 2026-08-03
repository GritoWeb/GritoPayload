import { defineCloudflareConfig } from '@opennextjs/cloudflare/config'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'
import d1NextTagCache from '@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache'

// Caching for the Cloudflare/OpenNext runtime.
//
// - incrementalCache: rendered HTML/RSC of ISR pages lives in a dedicated R2
//   bucket (binding NEXT_INC_CACHE_R2_BUCKET). This is what lets pages be served
//   from the edge instead of re-rendering + hitting D1 on every request.
// - tagCache: on-demand invalidation (revalidatePath / revalidateTag fired by the
//   admin hooks on publish) is tracked in a dedicated D1 db (binding
//   NEXT_TAG_CACHE_D1). The `revalidations` table is auto-created at deploy by
//   `opennextjs-cloudflare` populateCache.
// - queue: "direct" revalidates stale ISR pages inline, so we avoid provisioning
//   a Durable Object queue + WORKER_SELF_REFERENCE. Fine for this site's traffic.
//
// Both cache stores are deliberately SEPARATE from the Payload D1/R2 (bindings
// D1 / R2) so the content sync scripts (sync:prod, sync:local, verify-sync)
// never see them — they enumerate only the Payload bindings.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  tagCache: d1NextTagCache,
  queue: 'direct',
})
