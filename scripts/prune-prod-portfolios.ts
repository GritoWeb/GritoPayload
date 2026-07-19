/**
 * Deletes the existing portfolios from the target D1 and ensures the portfolio
 * tags the local content depends on exist. Companion to seed-portfolios.ts,
 * which skips existing slugs and never deletes.
 *
 *   DRY=1 NODE_ENV=production ALLOW_PRODUCTION=1 pnpm tsx scripts/prune-prod-portfolios.ts
 *   NODE_ENV=production ALLOW_PRODUCTION=1 pnpm tsx scripts/prune-prod-portfolios.ts
 *
 * Deleting through the Payload API (not raw SQL) so hooks, version rows and
 * relationship cleanup run the same way the admin would do it.
 *
 * Back up first — backups/ is written by scripts/backup-prod-content.mjs.
 */
import 'dotenv/config' // must precede payload.config, which reads PAYLOAD_SECRET
import { getPayload } from 'payload'

import config from '../src/payload.config'

const DRY_RUN = process.env.DRY === '1'

/** Tags the seeded cases are assigned by hand in the admin. */
const REQUIRED_TAGS = [{ title: 'EAD', slug: 'ead' }]

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION !== '1') {
    throw new Error(
      'Recusando rodar contra produção. Remova NODE_ENV=production, ou passe ALLOW_PRODUCTION=1 para confirmar que é intencional.',
    )
  }

  const payload = await getPayload({ config })
  const target = process.env.NODE_ENV === 'production' ? 'REMOTO (produção)' : 'local'
  console.log(`\n▸ alvo: D1 ${target}${DRY_RUN ? ' — DRY RUN' : ''}`)

  // ── 1) Tags que o conteúdo depende ─────────────────────────────────────────
  for (const tag of REQUIRED_TAGS) {
    const found = await payload.find({
      collection: 'portfolio-tags',
      where: { slug: { equals: tag.slug } },
      limit: 1,
      depth: 0,
    })
    if (found.docs.length) {
      console.log(`    = tag "${tag.title}" já existe (id ${found.docs[0].id})`)
      continue
    }
    if (DRY_RUN) {
      console.log(`    + tag "${tag.title}" seria criada`)
      continue
    }
    const created = await payload.create({
      collection: 'portfolio-tags',
      data: { title: tag.title, slug: tag.slug, generateSlug: false },
      context: { disableRevalidate: true },
    })
    console.log(`    + tag "${tag.title}" criada (id ${created.id})`)
  }

  // ── 2) Apaga os portfólios existentes ──────────────────────────────────────
  const existing = await payload.find({
    collection: 'portfolios',
    limit: 200,
    pagination: false,
    depth: 0,
    locale: 'pt',
  })
  console.log(`\n▸ ${existing.docs.length} portfólio(s) existentes:`)
  for (const doc of existing.docs) console.log(`    − ${doc.slug} — "${doc.title}"`)

  if (DRY_RUN) {
    console.log('    (DRY — nada apagado)')
    return
  }

  for (const doc of existing.docs) {
    await payload.delete({
      collection: 'portfolios',
      id: doc.id,
      depth: 0,
      context: { disableRevalidate: true },
    })
  }
  console.log('    ✓ apagados')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
