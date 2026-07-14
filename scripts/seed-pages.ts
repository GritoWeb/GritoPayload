/**
 * Grava o conteúdo final das páginas (PT + EN) no D1 LOCAL, via Local API do Payload.
 *
 *   pnpm tsx scripts/seed-pages.ts                  # todas as páginas
 *   PAGE=servicos pnpm tsx scripts/seed-pages.ts    # só uma
 *   DRY=1 pnpm tsx scripts/seed-pages.ts            # não grava, só mostra o plano
 *
 * O conteúdo vive em scripts/content/<slug>.ts — este arquivo é só o mecanismo.
 *
 * Por que duas gravações por página e não uma: o `layout` é substituído por inteiro, e o
 * Payload gera IDs novos para cada bloco e cada linha de array. Se o PT e o EN fossem
 * gravados com IDs diferentes, o Payload os trataria como blocos distintos e o texto em
 * PT se perderia. Então: grava PT → relê os IDs gerados → grava EN com esses mesmos IDs.
 *
 * As flags vêm por env, e não por argv, porque payload.config roda realpath() em cada
 * item de process.argv para detectar se está sob o CLI — um argumento que não é caminho
 * de arquivo derruba o config antes do script começar.
 *
 * Alvo é sempre o D1 local (payload.config usa getPlatformProxy sem bindings remotos
 * quando NODE_ENV !== 'production'). Não rode com NODE_ENV=production.
 */
import 'dotenv/config' // precisa vir antes de payload.config, que lê PAYLOAD_SECRET

import { getPayload } from 'payload'
import type { Payload } from 'payload'

import config from '../src/payload.config'
import { PAGES } from './content'
import type { Block, Locale, PageContent } from './content/types'

const DRY_RUN = process.env.DRY === '1'
const ONLY = process.env.PAGE

/**
 * Copia os IDs gerados pelo Payload (source) para a árvore que vamos gravar (target),
 * casando pela posição. Desce recursivamente em qualquer array de objetos (features,
 * services, steps, stats, partners, channels, items…).
 */
function graftIds(target: unknown[], source: unknown[]): void {
  target.forEach((node, i) => {
    const saved = source[i]
    if (!node || typeof node !== 'object' || !saved || typeof saved !== 'object') return

    const t = node as Record<string, unknown>
    const s = saved as Record<string, unknown>

    if (s.id !== undefined) t.id = s.id

    for (const key of Object.keys(t)) {
      if (Array.isArray(t[key]) && Array.isArray(s[key])) {
        graftIds(t[key] as unknown[], s[key] as unknown[])
      }
    }
  })
}

/** Devolve `preferred`, preenchendo com `fallback` cada campo nulo/ausente. */
function mergeMissing(preferred: Record<string, unknown>, fallback: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...fallback }

  for (const [key, value] of Object.entries(preferred)) {
    if (value === null || value === undefined) continue

    const base = fallback[key]
    if (Array.isArray(value) && Array.isArray(base)) {
      out[key] = value.map((row, i) =>
        row && typeof row === 'object' && base[i] && typeof base[i] === 'object'
          ? mergeMissing(row as Record<string, unknown>, base[i] as Record<string, unknown>)
          : row,
      )
      continue
    }

    out[key] = value
  }

  return out
}

/** Remove os IDs antigos: os blocos são recriados e o graftIds cuida de realinhar. */
function stripIds<T>(node: T): T {
  if (Array.isArray(node)) return node.map(stripIds) as unknown as T
  if (!node || typeof node !== 'object') return node

  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (key === 'id') continue
    out[key] = stripIds(value)
  }
  return out as T
}

/**
 * Resolve os blocos preservados. No EN o Payload devolve null nos campos sem tradução
 * (buscamos com fallback desligado), então caímos no valor em PT — que é exatamente o
 * que a página já exibe hoje via fallback.
 */
function pickPassthrough(
  content: PageContent,
  layoutPt: Block[],
  layoutEn: Block[],
  locale: Locale,
) {
  const out: Record<string, Block | undefined> = {}

  for (const blockType of content.passthroughBlocks) {
    const pt = layoutPt.find((b) => b.blockType === blockType)
    if (!pt) continue

    out[blockType] =
      locale === 'pt'
        ? stripIds(pt)
        : stripIds(mergeMissing(layoutEn.find((b) => b.blockType === blockType) ?? {}, pt))
  }

  return out
}

async function seedPage(payload: Payload, content: PageContent) {
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: content.slug } },
    locale: 'pt',
    depth: 0,
    limit: 1,
  })

  const page = docs[0]
  if (!page) {
    console.log(`\n✗ "${content.slug}" — página não existe no CMS. Pulando.`)
    return false
  }

  const current = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
  })

  // Os tipos gerados do Payload são a união dos blocos; aqui tratamos o layout como dados
  // genéricos (copiamos ids, lemos blockType), então descemos para Block[] via unknown.
  const layoutPt = (page.layout ?? []) as unknown as Block[]
  const layoutEn = (current.layout ?? []) as unknown as Block[]

  // Round-trip por JSON para QUEBRAR identidade de referência. Os arquivos de conteúdo
  // reaproveitam objetos (LOREM_FEATURES, STATS, CHANNELS) entre blocos e entre páginas;
  // sem isto o mesmo array chega duas vezes no mesmo documento, o Payload gera um id só
  // para as duas linhas e o insert estoura no UNIQUE. structuredClone não serve: ele
  // preserva a identidade de referências repetidas, que é exatamente o que queremos perder.
  const fresh = <T>(value: T): T => JSON.parse(JSON.stringify(value))

  const dataPt = fresh(content.build('pt', pickPassthrough(content, layoutPt, layoutEn, 'pt')))
  const dataEn = fresh(content.build('en', pickPassthrough(content, layoutPt, layoutEn, 'en')))

  // `title` é obrigatório e localizado, mas nunca foi traduzido em várias páginas — está
  // null no EN, e o update reprovaria na validação. É o nome da página no admin, não
  // aparece no site: reaproveitamos o valor em PT quando não há tradução.
  Object.assign(dataPt, { title: page.title })
  Object.assign(dataEn, { title: current.title || page.title })

  console.log(`\n▸ "${content.slug}" (id ${page.id}) — ${layoutPt.length} → ${dataPt.layout.length} blocos`)
  for (const block of dataPt.layout) {
    const kept = content.passthroughBlocks.includes(block.blockType as string)
    console.log(`    ${block.blockType}${kept ? '  (preservado)' : ''}`)
  }

  if (DRY_RUN) return true

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'pt',
    data: { ...dataPt, _status: 'published' } as never,
    // O afterChange hook chama revalidatePath() do Next, que exige um request context e
    // estoura fora dele. Em dev o cache revalida sozinho.
    context: { disableRevalidate: true },
  })

  // Relê para descobrir os IDs que o Payload acabou de gerar.
  const saved = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'pt',
    depth: 0,
  })

  graftIds(dataEn.layout, (saved.layout ?? []) as unknown[])

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    data: { ...dataEn, _status: 'published' } as never,
    context: { disableRevalidate: true },
  })

  console.log('    ✓ PT e EN gravados')
  return true
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Recusando rodar contra produção. Remova NODE_ENV=production.')
  }

  const targets = ONLY ? PAGES.filter((p) => p.slug === ONLY) : PAGES
  if (!targets.length) {
    throw new Error(`Nenhuma página "${ONLY}". Disponíveis: ${PAGES.map((p) => p.slug).join(', ')}`)
  }

  const payload = await getPayload({ config })

  let ok = 0
  for (const content of targets) {
    if (await seedPage(payload, content)) ok++
  }

  console.log(
    DRY_RUN
      ? `\nDRY: ${ok}/${targets.length} página(s) — nada gravado.`
      : `\nPronto: ${ok}/${targets.length} página(s). Confira em http://localhost:3000 e /en`,
  )
  process.exit(0)
}

main().catch((err) => {
  console.error('Falhou:', err.message)

  // Erros de validação do Payload chegam aninhados em cause.errors; sem isto, o log
  // mostra apenas "[Object]" e não dá para saber qual campo reprovou.
  const errors = err?.cause?.errors
  if (Array.isArray(errors)) {
    console.error('\nCampos reprovados:')
    console.error(JSON.stringify(errors, null, 2))
  }

  process.exit(1)
})
