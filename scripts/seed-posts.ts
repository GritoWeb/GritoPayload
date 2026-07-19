/**
 * Substitui os posts do D1 LOCAL pelo conteúdo real em markdown.
 *
 *   pnpm tsx scripts/seed-posts.ts                 # apaga placeholders + cadastra
 *   DRY=1 pnpm tsx scripts/seed-posts.ts           # só mostra o plano, não grava
 *   KEEP=1 pnpm tsx scripts/seed-posts.ts          # cadastra sem apagar os existentes
 *
 * O conteúdo vem de arquivos .md em CONTENT_DIR (default: ~/Projetos/claude/gritoweb/blog),
 * um arquivo por locale, registrados na lista POSTS abaixo. O corpo é convertido de
 * markdown para Lexical com o convertMarkdownToLexical do próprio Payload.
 *
 * Particularidades dos arquivos de conteúdo:
 *  - frontmatter e o H1 saem do corpo (o H1 vira o campo `title`);
 *  - o rodapé (comentário "LINKS INTERNOS" + seção "### SEO") é cortado do corpo,
 *    mas o meta title/description são extraídos dele;
 *  - o texto vem com quebra de linha dura em ~100 colunas; as linhas são reagrupadas
 *    por parágrafo antes da conversão, senão cada linha viraria um parágrafo próprio.
 *
 * O slug NÃO é localizado no schema (um só para PT e EN), então usamos o do arquivo PT
 * e gravamos com generateSlug=false para o update em EN não regenerá-lo do título inglês.
 *
 * Alvo é sempre o D1 local (mesma regra do seed-pages.ts). Não rode com NODE_ENV=production.
 */
import 'dotenv/config' // precisa vir antes de payload.config, que lê PAYLOAD_SECRET

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { getPayload } from 'payload'

import config from '../src/payload.config'

const CONTENT_DIR =
  process.env.CONTENT_DIR ?? join(process.env.HOME ?? '', 'Projetos/claude/gritoweb/blog')
const DRY_RUN = process.env.DRY === '1'
const KEEP = process.env.KEEP === '1'

/** Um post = um arquivo por locale. O slug vem da seção SEO do arquivo PT. */
const POSTS: { pt: string; en: string }[] = [
  { pt: 'por-que-wordpress.md', en: 'why-wordpress-en.md' },
]

type ParsedPost = {
  title: string
  body: string
  metaTitle?: string
  metaDescription?: string
  slug?: string
}

/**
 * Reagrupa linhas quebradas em ~100 colunas nos seus blocos lógicos: parágrafos e
 * citações viram uma linha só; itens de lista absorvem suas linhas de continuação.
 */
function unwrapHardBreaks(md: string): string {
  return md
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split('\n').filter((l) => l.trim() !== '')
      if (!lines.length) return ''
      if (/^#{1,6} /.test(lines[0])) return lines.join(' ')
      if (lines[0].startsWith('>')) {
        return '> ' + lines.map((l) => l.replace(/^> ?/, '')).join(' ')
      }
      if (/^[-*] /.test(lines[0])) {
        const items: string[] = []
        for (const line of lines) {
          if (/^[-*] /.test(line)) items.push(line)
          else items[items.length - 1] += ' ' + line.trim()
        }
        return items.join('\n')
      }
      return lines.join(' ')
    })
    .filter(Boolean)
    .join('\n\n')
}

function parsePost(file: string): ParsedPost {
  const raw = readFileSync(join(CONTENT_DIR, file), 'utf8')

  const withoutFrontmatter = raw.replace(/^---\n[\s\S]*?\n---\n/, '')

  const titleMatch = withoutFrontmatter.match(/^# (.+)$/m)
  if (!titleMatch) throw new Error(`${file}: não achei o H1 do título`)
  const title = titleMatch[1].trim()

  // O corpo termina onde começa o rodapé de produção (comentário de links internos).
  const footerIdx = withoutFrontmatter.indexOf('<!-- LINKS INTERNOS')
  let body = footerIdx >= 0 ? withoutFrontmatter.slice(0, footerIdx) : withoutFrontmatter
  body = body
    .replace(/^# .+$/m, '')
    .replace(/\n-{3,}\s*$/, '')
    .trim()

  const metaTitle = withoutFrontmatter.match(/\*\*Meta title:\*\* *(.+)/)?.[1]?.trim()
  const metaDescription = withoutFrontmatter.match(/\*\*Meta description:\*\* *(.+)/)?.[1]?.trim()
  // "**Slug:** /blog/por-que-wordpress" → último segmento do caminho
  const slugLine = withoutFrontmatter.match(/\*\*Slug:\*\* *(.+)/)?.[1]?.trim()
  const slug = slugLine?.split('/').filter(Boolean).pop()

  return { title, body: unwrapHardBreaks(body), metaTitle, metaDescription, slug }
}

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION !== '1') {
    throw new Error(
      'Recusando rodar contra produção. Remova NODE_ENV=production, ou passe ALLOW_PRODUCTION=1 para confirmar que é intencional.',
    )
  }

  const payload = await getPayload({ config })
  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  const toLexical = async (markdown: string) =>
    convertMarkdownToLexical({ editorConfig, markdown })

  // ── 1) Apaga os posts existentes (placeholders) ────────────────────────────
  const existing = await payload.find({
    collection: 'posts',
    limit: 200,
    pagination: false,
    depth: 0,
    locale: 'pt',
  })
  console.log(`\n▸ ${existing.docs.length} post(s) existentes:`)
  for (const doc of existing.docs) console.log(`    − ${doc.slug} — "${doc.title}"`)

  if (!DRY_RUN && !KEEP) {
    for (const doc of existing.docs) {
      await payload.delete({
        collection: 'posts',
        id: doc.id,
        depth: 0,
        context: { disableRevalidate: true },
      })
    }
    console.log('    ✓ apagados')
  } else {
    console.log(KEEP ? '    (KEEP=1 — mantidos)' : '    (DRY — nada apagado)')
  }

  // ── 2) Cadastra os posts novos: cria em PT, depois grava o locale EN ───────
  for (const files of POSTS) {
    const pt = parsePost(files.pt)
    const en = parsePost(files.en)
    const slug = pt.slug
    if (!slug) throw new Error(`${files.pt}: seção SEO não define o slug`)

    console.log(`\n▸ "${pt.title}" → /posts/${slug}`)
    console.log(`    EN: "${en.title}"`)

    if (DRY_RUN) continue

    const shared = { generateSlug: false, slug, _status: 'published' as const }

    const created = await payload.create({
      collection: 'posts',
      locale: 'pt',
      depth: 0,
      context: { disableRevalidate: true },
      data: {
        ...shared,
        title: pt.title,
        excerpt: pt.metaDescription,
        content: await toLexical(pt.body),
        meta: { title: pt.metaTitle, description: pt.metaDescription },
      } as never,
    })

    await payload.update({
      collection: 'posts',
      id: created.id,
      locale: 'en',
      depth: 0,
      context: { disableRevalidate: true },
      data: {
        ...shared,
        title: en.title,
        excerpt: en.metaDescription,
        content: await toLexical(en.body),
        meta: { title: en.metaTitle, description: en.metaDescription },
      } as never,
    })

    console.log('    ✓ PT e EN gravados (publicado)')
  }

  console.log(
    DRY_RUN
      ? '\nDRY: nada gravado.'
      : '\nPronto. Confira em http://localhost:3000/posts e /en/posts',
  )
  process.exit(0)
}

main().catch((err) => {
  console.error('Falhou:', err.message)
  const errors = err?.cause?.errors
  if (Array.isArray(errors)) {
    console.error('\nCampos reprovados:')
    console.error(JSON.stringify(errors, null, 2))
  }
  process.exit(1)
})
