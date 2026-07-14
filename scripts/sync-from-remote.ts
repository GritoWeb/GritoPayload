/**
 * Sincroniza o ambiente LOCAL a partir do REMOTO (Cloudflare) — D1 + R2.
 *
 * O que faz, em ordem:
 *   1. Lê do D1 remoto: schema (DDL de todas as tabelas/índices) e a definição
 *      da virtual table de busca (posts_fts). Conta as linhas por tabela.
 *   2. Baixa TODOS os objetos do R2 remoto para a memória (com o content-type real).
 *   3. Zera o `.wrangler` local e recria o schema idêntico ao de produção.
 *   4. Exporta os dados das tabelas não-vazias (wrangler d1 export) e importa no local.
 *   5. Reconstrói o índice de busca FTS (pnpm reindex:search).
 *   6. Grava os objetos do R2 no bucket local, preservando o content-type
 *      (essencial: sem isso o Chrome não renderiza SVGs). Ver scripts/README ou
 *      @payloadcms/storage-r2/getFile.ts — em dev o Content-Type sai do httpMetadata.
 *
 * Pré-requisitos: estar logado (`wrangler login`) e, de preferência, com o
 * `pnpm dev` PARADO (este script apaga o `.wrangler`). Ao final, reinicie o dev.
 *
 * Por que não um simples `wrangler d1 export`? O D1 se recusa a exportar bancos
 * que contêm virtual tables (fts5), então montamos o dump tabela-a-tabela.
 */
import { execFileSync, execSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { getPlatformProxy } from 'wrangler'

const DB_BINDING = 'D1'
const R2_BINDING = 'R2'
const WRANGLER = './node_modules/.bin/wrangler'

// Tabelas que NÃO entram no dump de dados nem no schema recriado manualmente:
//  - posts_fts*  → a virtual table e suas tabelas-sombra são recriadas pelo CREATE VIRTUAL TABLE
//  - sqlite_stat1 → estatísticas do planner, regeneradas por ANALYZE
//  - _cf_KV       → interna do D1
const isInternal = (name: string) =>
  name.startsWith('posts_fts') || name.startsWith('sqlite_') || name === 'sqlite_stat1' || name === '_cf_KV'

function log(msg: string) {
  console.log(msg)
}

/** Executa o wrangler e devolve o stdout (o banner vai pro stderr). */
function wrangler(args: string[]): string {
  return execFileSync(WRANGLER, args, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 512,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
}

async function main() {
  const tmp = mkdtempSync(join(tmpdir(), 'sync-remote-'))

  // ───────────────────────────────────────────────────────────────────────────
  // 1 + 2) Leituras do REMOTO (D1 schema/contagens + download do R2) numa sessão
  // ───────────────────────────────────────────────────────────────────────────
  log('▶ Conectando no remoto (D1 + R2)…')
  const remote = await getPlatformProxy<{ D1: D1Database; R2: R2Bucket }>({
    remoteBindings: true,
  })
  const D1r = (remote.env as any)[DB_BINDING] as D1Database
  const R2r = (remote.env as any)[R2_BINDING] as R2Bucket

  // Schema: DDL de tabelas e índices reais (exclui fts/sqlite/_cf_KV). Tabelas antes dos índices.
  const schemaRows = (
    await D1r.prepare(
      `SELECT sql FROM sqlite_master
       WHERE sql IS NOT NULL AND type IN ('table','index')
         AND name NOT LIKE 'posts_fts%' AND name NOT LIKE 'sqlite_%' AND name <> '_cf_KV'
       ORDER BY (type = 'index')`,
    ).all<{ sql: string }>()
  ).results
  const schemaDDL = schemaRows.map((r) => r.sql).join(';\n\n') + ';'

  // Definição da virtual table de busca (recriada à parte; recria as tabelas-sombra sozinha).
  const ftsRow = (
    await D1r.prepare(`SELECT sql FROM sqlite_master WHERE name = 'posts_fts'`).first<{ sql: string }>()
  )
  const ftsDDL = ftsRow?.sql ? ftsRow.sql + ';' : null

  // Lista de tabelas de dados e contagem de linhas (para pular tabelas vazias).
  const tableRows = (
    await D1r.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).all<{
      name: string
    }>()
  ).results
  const dataTables = tableRows.map((r) => r.name).filter((n) => !isInternal(n))

  // Conta linha-a-linha por tabela (o D1 remoto tem um limite baixo de termos em
  // compound SELECT, então nada de UNION ALL). Em caso de erro, mantém a tabela.
  const nonEmpty: string[] = []
  const BATCH = 12
  for (let i = 0; i < dataTables.length; i += BATCH) {
    const batch = dataTables.slice(i, i + BATCH)
    const results = await Promise.all(
      batch.map(async (t) => {
        try {
          const row = await D1r.prepare(`SELECT count(*) AS n FROM "${t}"`).first<{ n: number }>()
          return { t, n: row?.n ?? 1 }
        } catch {
          return { t, n: 1 }
        }
      }),
    )
    for (const c of results) if (c.n > 0) nonEmpty.push(c.t)
  }
  log(`  schema: ${schemaRows.length} objetos · dados: ${nonEmpty.length}/${dataTables.length} tabelas com linhas`)

  // Download de TODOS os objetos do R2 remoto (com content-type) para a memória.
  log('▶ Baixando arquivos do R2 remoto…')
  const r2files: { key: string; buf: Buffer; contentType?: string }[] = []
  let cursor: string | undefined
  do {
    const listed: any = await R2r.list(cursor ? { cursor } : undefined)
    for (const o of listed.objects) {
      const obj = await R2r.get(o.key)
      if (!obj) continue
      r2files.push({
        key: o.key,
        buf: Buffer.from(await obj.arrayBuffer()),
        contentType: obj.httpMetadata?.contentType,
      })
    }
    cursor = listed.truncated ? listed.cursor : undefined
  } while (cursor)
  log(`  ${r2files.length} objeto(s) no R2 remoto`)

  await remote.dispose()

  // ───────────────────────────────────────────────────────────────────────────
  // 3) Zera o local e recria o schema
  // ───────────────────────────────────────────────────────────────────────────
  log('▶ Zerando o .wrangler local e recriando o schema…')
  rmSync('.wrangler', { recursive: true, force: true })

  const schemaFile = join(tmp, 'schema.sql')
  writeFileSync(schemaFile, ftsDDL ? `${schemaDDL}\n\n${ftsDDL}\n` : `${schemaDDL}\n`)
  wrangler(['d1', 'execute', DB_BINDING, '--local', '--file', schemaFile, '--yes'])

  // ───────────────────────────────────────────────────────────────────────────
  // 4) Exporta os dados do remoto (tabela-a-tabela) e importa no local
  // ───────────────────────────────────────────────────────────────────────────
  log('▶ Exportando dados do remoto…')
  const inserts: string[] = []
  let done = 0
  for (const t of nonEmpty) {
    const part = join(tmp, `${t.replace(/[^\w.-]/g, '_')}.sql`)
    wrangler(['d1', 'export', DB_BINDING, '--remote', '--no-schema', `--table=${t}`, `--output=${part}`])
    for (const line of readFileSync(part, 'utf8').split('\n')) {
      if (line.startsWith('INSERT')) inserts.push(line)
    }
    done++
    if (done % 20 === 0) log(`  …${done}/${nonEmpty.length} tabelas`)
  }
  log(`  ${inserts.length} registros. Importando no local…`)
  const dataFile = join(tmp, '_data.sql')
  writeFileSync(dataFile, `PRAGMA defer_foreign_keys=TRUE;\n${inserts.join('\n')}\n`)
  wrangler(['d1', 'execute', DB_BINDING, '--local', '--file', dataFile, '--yes'])

  // ───────────────────────────────────────────────────────────────────────────
  // 5) Reconstrói o índice de busca FTS a partir dos dados importados
  // ───────────────────────────────────────────────────────────────────────────
  if (ftsDDL) {
    log('▶ Reconstruindo índice de busca (posts_fts)…')
    execSync('pnpm reindex:search', { stdio: 'inherit' })
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 6) Grava os objetos do R2 no bucket LOCAL, com content-type
  // ───────────────────────────────────────────────────────────────────────────
  log('▶ Gravando arquivos no R2 local…')
  const local = await getPlatformProxy<{ R2: R2Bucket }>({ remoteBindings: false })
  const R2l = (local.env as any)[R2_BINDING] as R2Bucket
  for (const f of r2files) {
    // Miniflare exige Blob em vez de Buffer (workers-sdk#6047)
    await R2l.put(f.key, new Blob([f.buf]), { httpMetadata: { contentType: f.contentType } })
  }
  await local.dispose()

  rmSync(tmp, { recursive: true, force: true })

  log('')
  log('✅ Sincronização concluída.')
  log(`   D1: ${nonEmpty.length} tabelas · R2: ${r2files.length} arquivos`)
  log('   ⚠  Reinicie o `pnpm dev` para carregar os dados e metadados atualizados.')
}

main().catch((err) => {
  console.error('\n✘ Falha na sincronização:', err?.message || err)
  console.error('  Dica: confira se você está logado (`wrangler login`) e se o `pnpm dev` está parado.')
  process.exit(1)
})
