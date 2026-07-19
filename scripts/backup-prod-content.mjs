/**
 * Dumps production posts/portfolios tables from the remote D1 to JSON.
 * Read-only against production. Run before any destructive content change.
 *
 *   node scripts/backup-prod-content.mjs
 *
 * Output: backups/prod-content-<timestamp>/<table>.json + manifest.json
 * Skips posts_fts* (derived index, rebuildable with `pnpm reindex:search`).
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const TABLES = [
  'posts',
  'posts_locales',
  'posts_rels',
  '_posts_v',
  '_posts_v_locales',
  '_posts_v_rels',
  'portfolios',
  'portfolios_locales',
  'portfolios_rels',
  'portfolios_gallery',
  'portfolios_process_steps',
  'portfolios_stack',
  'portfolios_stats',
  'portfolios_team',
  '_portfolios_v',
  '_portfolios_v_locales',
  '_portfolios_v_rels',
  '_portfolios_v_version_gallery',
  '_portfolios_v_version_process_steps',
  '_portfolios_v_version_stack',
  '_portfolios_v_version_stats',
  '_portfolios_v_version_team',
  'portfolio_tags',
]

function query(sql) {
  const out = execFileSync(
    'npx',
    ['wrangler', 'd1', 'execute', 'D1', '--remote', '--command', sql, '--json'],
    { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] },
  )
  const start = out.indexOf('[')
  return JSON.parse(out.slice(start))[0].results
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const dir = join('backups', `prod-content-${stamp}`)
mkdirSync(dir, { recursive: true })

const manifest = { takenAt: new Date().toISOString(), target: 'remote D1 (cloudflare-payload-db)', tables: {} }
let total = 0

for (const t of TABLES) {
  try {
    const rows = query(`SELECT * FROM ${t};`)
    writeFileSync(join(dir, `${t}.json`), JSON.stringify(rows, null, 2))
    manifest.tables[t] = rows.length
    total += rows.length
    console.log(`${String(rows.length).padStart(5)}  ${t}`)
  } catch (e) {
    manifest.tables[t] = `ERROR: ${e.message.slice(0, 120)}`
    console.log(`  ERR  ${t} — ${e.message.slice(0, 80)}`)
  }
}

manifest.totalRows = total
writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`\n${total} linhas em ${dir}`)
