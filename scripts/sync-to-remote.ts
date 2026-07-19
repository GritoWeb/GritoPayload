/**
 * Sobrescreve o REMOTO (Cloudflare) com o ambiente LOCAL — D1 + R2.
 * É o espelho do scripts/sync-from-remote.ts, na direção contrária.
 *
 * ⚠ DESTRUTIVO: apaga TODO o conteúdo do banco de produção (incluindo usuários
 *   e sessões do admin) e o substitui pelo banco local. Rode sem CONFIRM=1 para
 *   ver o plano (dry-run); rode com CONFIRM=1 para executar de verdade:
 *
 *     pnpm sync:prod              # dry-run: mostra o que mudaria
 *     CONFIRM=1 pnpm sync:prod    # sobrescreve produção
 *
 * O que faz, em ordem:
 *   1. Compara o schema local × remoto (DDL das tabelas). Se divergirem, aborta
 *      com instrução de rodar `pnpm deploy` primeiro (migrations).
 *   2. Anota o bookmark do Time Travel do D1 (rollback em até 30 dias):
 *      `wrangler d1 time-travel restore D1 --bookmark=<...>`
 *   3. Monta um dump: DELETE de todas as tabelas remotas + INSERTs dos dados
 *      locais (wrangler d1 export tabela-a-tabela, por causa da virtual table
 *      fts5) + reconstrução do posts_fts a partir das linhas locais.
 *   4. Executa o dump no D1 remoto numa carga só e roda PRAGMA optimize.
 *   5. Sobe todos os objetos do R2 local para o remoto (preservando o
 *      content-type). Objetos que só existem no remoto ficam lá, a menos que
 *      PRUNE=1 (aí são apagados, deixando o R2 idêntico ao local).
 *
 * Pré-requisito: estar logado (`wrangler login`). O `pnpm dev` pode ficar de pé
 * (o local é apenas lido), mas evite editar conteúdo durante o push.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { getPlatformProxy } from 'wrangler'

const DB_BINDING = 'D1'
const R2_BINDING = 'R2'
const WRANGLER = './node_modules/.bin/wrangler'

const CONFIRM = process.env.CONFIRM === '1'
const PRUNE = process.env.PRUNE === '1'

// Mesmo critério do sync-from-remote (mais a _cf_METADATA, interna do miniflare local).
const INTERNAL_SQL = `name NOT LIKE 'posts_fts%' AND name NOT LIKE 'sqlite\\_%' ESCAPE '\\' AND name NOT LIKE '\\_cf\\_%' ESCAPE '\\'`

const q = (v: unknown) => (v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`)

function log(msg: string) {
  console.log(msg)
}

function wrangler(args: string[]): string {
  return execFileSync(WRANGLER, args, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 512,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

type Proxy = Awaited<ReturnType<typeof getPlatformProxy>>

async function tableDDL(db: D1Database): Promise<Map<string, string>> {
  const rows = (
    await db
      .prepare(
        `SELECT name, sql FROM sqlite_master
         WHERE type = 'table' AND sql IS NOT NULL AND ${INTERNAL_SQL}`,
      )
      .all<{ name: string; sql: string }>()
  ).results
  return new Map(rows.map((r) => [r.name, r.sql.replace(/\s+/g, ' ').trim()]))
}

async function tableCounts(db: D1Database, tables: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  const BATCH = 12
  for (let i = 0; i < tables.length; i += BATCH) {
    const batch = tables.slice(i, i + BATCH)
    const results = await Promise.all(
      batch.map(async (t) => {
        try {
          const row = await db.prepare(`SELECT count(*) AS n FROM "${t}"`).first<{ n: number }>()
          return { t, n: row?.n ?? 0 }
        } catch {
          return { t, n: 0 }
        }
      }),
    )
    for (const c of results) counts.set(c.t, c.n)
  }
  return counts
}

/**
 * Ordena as tabelas topologicamente pelas foreign keys (mães antes das filhas).
 * Necessário porque o wrangler executa o dump remoto em lotes e o
 * `PRAGMA defer_foreign_keys` não atravessa lotes — a ordem precisa ser válida
 * com checagem imediata: DELETE das filhas primeiro, INSERT das mães primeiro.
 */
async function topoSort(db: D1Database, tables: string[]): Promise<string[]> {
  const inSet = new Set(tables)
  const parents = new Map<string, Set<string>>()
  for (const t of tables) {
    const rows = (await db.prepare(`PRAGMA foreign_key_list("${t}")`).all<{ table: string }>()).results
    parents.set(t, new Set(rows.map((r) => r.table).filter((p) => p !== t && inSet.has(p))))
  }
  const ordered: string[] = []
  const placed = new Set<string>()
  let remaining = [...tables].sort()
  while (remaining.length > 0) {
    const ready = remaining.filter((t) => [...parents.get(t)!].every((p) => placed.has(p)))
    if (ready.length === 0) {
      // Ciclo de FKs (não deveria acontecer com schema do Payload) — segue a ordem alfabética.
      ordered.push(...remaining)
      break
    }
    for (const t of ready) {
      ordered.push(t)
      placed.add(t)
    }
    remaining = remaining.filter((t) => !placed.has(t))
  }
  return ordered
}

async function listR2(bucket: R2Bucket): Promise<Map<string, number>> {
  const keys = new Map<string, number>()
  let cursor: string | undefined
  do {
    const listed: any = await bucket.list(cursor ? { cursor } : undefined)
    for (const o of listed.objects) keys.set(o.key, o.size)
    cursor = listed.truncated ? listed.cursor : undefined
  } while (cursor)
  return keys
}

async function main() {
  // ───────────────────────────────────────────────────────────────────────────
  // Conecta nos dois lados (local só é LIDO; remoto só é escrito com CONFIRM=1)
  // ───────────────────────────────────────────────────────────────────────────
  log('▶ Conectando no local e no remoto…')
  const local: Proxy = await getPlatformProxy({ remoteBindings: false })
  const remote: Proxy = await getPlatformProxy({ remoteBindings: true })
  const D1l = (local.env as any)[DB_BINDING] as D1Database
  const D1r = (remote.env as any)[DB_BINDING] as D1Database
  const R2l = (local.env as any)[R2_BINDING] as R2Bucket
  const R2r = (remote.env as any)[R2_BINDING] as R2Bucket

  // ───────────────────────────────────────────────────────────────────────────
  // 1) Schema local × remoto precisa bater (migrations em dia dos dois lados)
  // ───────────────────────────────────────────────────────────────────────────
  const [ddlLocal, ddlRemote] = await Promise.all([tableDDL(D1l), tableDDL(D1r)])
  const mismatches: string[] = []
  for (const [name, sql] of ddlLocal) {
    const remoteSql = ddlRemote.get(name)
    if (!remoteSql) mismatches.push(`${name} (não existe no remoto)`)
    else if (remoteSql !== sql) mismatches.push(`${name} (DDL diferente)`)
  }
  for (const name of ddlRemote.keys()) {
    if (!ddlLocal.has(name)) mismatches.push(`${name} (só existe no remoto)`)
  }
  if (mismatches.length > 0) {
    console.error('✘ O schema local difere do remoto — rode `pnpm deploy` (ou `pnpm deploy:database`) antes do push:')
    for (const m of mismatches) console.error(`   · ${m}`)
    process.exit(1)
  }

  const tables = [...ddlLocal.keys()].sort()
  const [countsLocal, countsRemote] = await Promise.all([
    tableCounts(D1l, tables),
    tableCounts(D1r, tables),
  ])

  // Linhas do índice de busca local (a fts5 não entra no export do wrangler,
  // então copiamos as linhas direto — o índice local está sempre em dia via hooks).
  const ftsRows = (
    await D1l.prepare(`SELECT title, excerpt, content, parent_id, locale FROM posts_fts`).all<{
      title: string
      excerpt: string
      content: string
      parent_id: number
      locale: string
    }>()
  ).results

  // R2 dos dois lados, para o resumo e para o diff de upload/prune.
  const [r2Local, r2Remote] = await Promise.all([listR2(R2l), listR2(R2r)])
  const r2OnlyRemote = [...r2Remote.keys()].filter((k) => !r2Local.has(k))

  // ───────────────────────────────────────────────────────────────────────────
  // Resumo do plano
  // ───────────────────────────────────────────────────────────────────────────
  log('')
  log('  Plano (local → remoto):')
  let changed = 0
  for (const t of tables) {
    const l = countsLocal.get(t) ?? 0
    const r = countsRemote.get(t) ?? 0
    if (l !== r) {
      log(`   · ${t}: ${r} → ${l} linhas`)
      changed++
    }
  }
  if (changed === 0) log('   · D1: contagens idênticas (conteúdo ainda pode diferir — o push regrava tudo)')
  log(`   · posts_fts: ${ftsRows.length} linha(s) do índice de busca`)
  log(`   · R2: subir ${r2Local.size} objeto(s)` + (r2OnlyRemote.length
    ? `; ${r2OnlyRemote.length} só no remoto ${PRUNE ? '(serão APAGADOS — PRUNE=1)' : '(mantidos; use PRUNE=1 para apagar)'}`
    : ''))
  log('')

  if (!CONFIRM) {
    log('🔎 Dry-run — nada foi alterado.')
    log('   Para sobrescrever produção de verdade:  CONFIRM=1 pnpm sync:prod')
    log('   ⚠ Isso substitui TUDO no D1 remoto, inclusive usuários/sessões do admin.')
    await local.dispose()
    await remote.dispose()
    return
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2) Bookmark do Time Travel (caminho de rollback do D1)
  // ───────────────────────────────────────────────────────────────────────────
  try {
    const info = wrangler(['d1', 'time-travel', 'info', DB_BINDING])
    const bookmark = info.match(/[0-9a-f]{8,}-[0-9a-f-]+/i)?.[0] ?? info.trim().split('\n').pop()
    log(`▶ Time Travel bookmark (rollback do D1): ${bookmark}`)
    log(`   Restaurar: ${WRANGLER} d1 time-travel restore ${DB_BINDING} --bookmark=${bookmark}`)
  } catch {
    log('▶ Não consegui ler o bookmark do Time Travel (seguindo mesmo assim).')
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3) Monta o dump: DELETEs + INSERTs (export local tabela-a-tabela) + fts
  // ───────────────────────────────────────────────────────────────────────────
  const tmp = mkdtempSync(join(tmpdir(), 'sync-prod-'))
  log('▶ Exportando dados locais…')
  const ordered = await topoSort(D1l, tables)
  const statements: string[] = ['PRAGMA defer_foreign_keys=TRUE;']
  for (const t of [...ordered].reverse()) statements.push(`DELETE FROM "${t}";`)
  statements.push('DELETE FROM posts_fts;')

  let done = 0
  let records = 0
  for (const t of ordered) {
    if ((countsLocal.get(t) ?? 0) === 0) continue
    const part = join(tmp, `${t.replace(/[^\w.-]/g, '_')}.sql`)
    wrangler(['d1', 'export', DB_BINDING, '--local', '--no-schema', `--table=${t}`, `--output=${part}`])
    for (const line of readFileSync(part, 'utf8').split('\n')) {
      if (line.startsWith('INSERT')) {
        statements.push(line)
        records++
      }
    }
    done++
    if (done % 20 === 0) log(`  …${done} tabelas exportadas`)
  }
  for (const r of ftsRows) {
    statements.push(
      `INSERT INTO posts_fts (title, excerpt, content, parent_id, locale) VALUES (${q(r.title)}, ${q(r.excerpt)}, ${q(r.content)}, ${r.parent_id}, ${q(r.locale)});`,
    )
  }
  log(`  ${records} registros + ${ftsRows.length} linha(s) de índice`)

  // ───────────────────────────────────────────────────────────────────────────
  // 4) Executa no remoto
  // ───────────────────────────────────────────────────────────────────────────
  log('▶ Gravando no D1 remoto…')
  const dumpFile = join(tmp, '_push.sql')
  writeFileSync(dumpFile, statements.join('\n') + '\n')
  wrangler(['d1', 'execute', DB_BINDING, '--remote', '--file', dumpFile, '--yes'])
  wrangler(['d1', 'execute', DB_BINDING, '--remote', '--command', 'PRAGMA optimize', '--yes'])

  // ───────────────────────────────────────────────────────────────────────────
  // 5) R2: sobe tudo do local; com PRUNE=1 apaga o que só existe no remoto
  // ───────────────────────────────────────────────────────────────────────────
  log('▶ Subindo arquivos do R2 local para o remoto…')
  let uploaded = 0
  let cursor: string | undefined
  do {
    const listed: any = await R2l.list(cursor ? { cursor } : undefined)
    for (const o of listed.objects) {
      const obj = await R2l.get(o.key)
      if (!obj) continue
      const buf = Buffer.from(await obj.arrayBuffer())
      // Miniflare exige Blob em vez de Buffer (workers-sdk#6047)
      await R2r.put(o.key, new Blob([buf]), {
        httpMetadata: { contentType: obj.httpMetadata?.contentType },
      })
      uploaded++
    }
    cursor = listed.truncated ? listed.cursor : undefined
  } while (cursor)
  if (PRUNE) {
    for (const key of r2OnlyRemote) await R2r.delete(key)
  }
  log(`  ${uploaded} objeto(s) enviados` + (PRUNE ? ` · ${r2OnlyRemote.length} removido(s) do remoto` : ''))

  await local.dispose()
  await remote.dispose()
  rmSync(tmp, { recursive: true, force: true })

  log('')
  log('✅ Produção sobrescrita com o conteúdo local.')
  log('   ⚠ O login do admin em produção agora é o MESMO do ambiente local.')
}

main().catch((err) => {
  console.error('\n✘ Falha no push:', err?.message || err)
  console.error('  Dica: confira se você está logado (`wrangler login`).')
  process.exit(1)
})
