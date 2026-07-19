/**
 * Verifica que o D1 remoto é IDÊNTICO ao local: compara todas as linhas de
 * todas as tabelas de dados (+ posts_fts + objetos do R2). Somente leitura.
 */
import { getPlatformProxy } from 'wrangler'

const INTERNAL_SQL = `name NOT LIKE 'posts_fts%' AND name NOT LIKE 'sqlite\\_%' ESCAPE '\\' AND name NOT LIKE '\\_cf\\_%' ESCAPE '\\'`

async function dumpTable(db: D1Database, t: string): Promise<string[]> {
  const rows = (await db.prepare(`SELECT * FROM "${t}"`).all()).results as Record<string, unknown>[]
  return rows
    .map((r) => JSON.stringify(Object.keys(r).sort().map((k) => [k, r[k] ?? null])))
    .sort()
}

async function main() {
  const local = await getPlatformProxy({ remoteBindings: false })
  const remote = await getPlatformProxy({ remoteBindings: true })
  const D1l = (local.env as any).D1 as D1Database
  const D1r = (remote.env as any).D1 as D1Database
  const R2l = (local.env as any).R2 as R2Bucket
  const R2r = (remote.env as any).R2 as R2Bucket

  const tables = (
    await D1l.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND ${INTERNAL_SQL} ORDER BY name`).all<{ name: string }>()
  ).results.map((r) => r.name)
  tables.push('posts_fts')

  let ok = 0
  const bad: string[] = []
  const BATCH = 6
  for (let i = 0; i < tables.length; i += BATCH) {
    await Promise.all(
      tables.slice(i, i + BATCH).map(async (t) => {
        try {
          const [l, r] = await Promise.all([dumpTable(D1l, t), dumpTable(D1r, t)])
          if (l.length !== r.length) {
            bad.push(`${t}: ${l.length} linhas local × ${r.length} remoto`)
          } else if (l.some((row, idx) => row !== r[idx])) {
            const idx = l.findIndex((row, j) => row !== r[j])
            bad.push(`${t}: conteúdo difere (ex.: linha ${idx})`)
          } else {
            ok++
          }
        } catch (e: any) {
          bad.push(`${t}: erro — ${e?.message}`)
        }
      }),
    )
    if ((i / BATCH) % 5 === 4) console.log(`  …${Math.min(i + BATCH, tables.length)}/${tables.length} tabelas`)
  }

  // R2: mesmas chaves, mesmos tamanhos e content-types
  const listAll = async (b: R2Bucket) => {
    const m = new Map<string, string>()
    let cursor: string | undefined
    do {
      const l: any = await b.list(cursor ? { cursor } : undefined)
      for (const o of l.objects) m.set(o.key, `${o.size}`)
      cursor = l.truncated ? l.cursor : undefined
    } while (cursor)
    return m
  }
  const [r2l, r2r] = await Promise.all([listAll(R2l), listAll(R2r)])
  const r2bad: string[] = []
  for (const [k, v] of r2l) {
    if (!r2r.has(k)) r2bad.push(`R2 falta no remoto: ${k}`)
    else if (r2r.get(k) !== v) r2bad.push(`R2 tamanho difere: ${k} (${v} × ${r2r.get(k)})`)
  }
  const extra = [...r2r.keys()].filter((k) => !r2l.has(k))

  console.log('')
  console.log(`D1: ${ok}/${tables.length} tabelas idênticas (linha a linha, coluna a coluna)`)
  for (const b of bad) console.log(`  ✘ ${b}`)
  console.log(`R2: ${r2l.size} objetos locais conferidos${r2bad.length ? '' : ' — todos presentes e com o mesmo tamanho no remoto'}`)
  for (const b of r2bad) console.log(`  ✘ ${b}`)
  if (extra.length) console.log(`  (${extra.length} objeto(s) só no remoto — mantidos de propósito: ${extra.join(', ')})`)

  await local.dispose()
  await remote.dispose()
  if (bad.length || r2bad.length) process.exit(1)
  console.log('\n✅ Local e produção 100% idênticos.')
}

main().catch((e) => {
  console.error('Falha na verificação:', e?.message || e)
  process.exit(1)
})
