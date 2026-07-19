/**
 * Cadastra os cases de portfólio (Griddl e Bright Minds) no D1 LOCAL.
 *
 *   pnpm tsx scripts/seed-portfolios.ts            # cadastra (pula slugs já existentes)
 *   DRY=1 pnpm tsx scripts/seed-portfolios.ts      # só mostra o plano
 *
 * O texto vem dos arquivos em ~/Projetos/claude/gritoweb/portfolio, mapeado À MÃO para os
 * campos estruturados da collection (challenge, process, stats, stack) — o case em markdown
 * é narrativo e a collection é seccionada, então a redistribuição é editorial, não mecânica.
 *
 * Limitações conhecidas do schema (decisões conscientes, não bugs):
 *  - Só title/summary/meta são localizados. O corpo (challenge, process, stack) é único e
 *    fica em PT; a versão EN do Griddl entra apenas nos campos localizados.
 *  - A capa é obrigatória e ainda não existem imagens: sobe um SVG provisório na cor da
 *    marca (alt "capa provisória"), pra trocar no admin quando a arte ficar pronta.
 *  - Depoimentos (quote) ficam vazios — os arquivos marcam "aguardando depoimento".
 *
 * Alvo é sempre o D1 local. Não rode com NODE_ENV=production.
 */
import 'dotenv/config' // precisa vir antes de payload.config, que lê PAYLOAD_SECRET

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { getPayload } from 'payload'
import type { Payload } from 'payload'
import { getPlatformProxy } from 'wrangler'

import config from '../src/payload.config'

const DRY_RUN = process.env.DRY === '1'
const COVERS_DIR =
  process.env.COVERS_DIR ??
  '/private/tmp/claude-501/-Users-richardsouto-Projetos-gritoweb-gritoweb-site/a12f5ab9-4895-40e3-b961-0b1301f76554/scratchpad'

type Localized = { pt: string; en?: string }

type Case = {
  slug: string
  coverFile: string
  coverAlt: string
  client: string
  title: Localized
  summary: Localized
  metaTitle: Localized
  metaDescription: Localized
  year?: string
  result?: string
  siteUrl: string
  sector: string
  deliverables: string
  duration: string
  accent: 'blue' | 'orange'
  challengeTitle: string
  challengeBody: string
  processSteps: { number: string; title: string; description: string }[]
  stats?: { value: string; label: string }[]
  stack: string[]
  nextProjectHref: string
}

const CASES: Case[] = [
  {
    slug: 'griddl',
    coverFile: 'capa-griddl.svg',
    coverAlt: 'Capa provisória do case Griddl',
    client: 'Griddl',
    title: { pt: 'Agência Griddl', en: 'Griddl' },
    summary: {
      pt: 'Como a GritoWeb virou o braço técnico da Griddl.',
      en: "How GritoWeb became Griddl's technical arm.",
    },
    metaTitle: {
      pt: 'Case Griddl: o braço técnico de uma agência da Califórnia | GritoWeb',
      en: 'Griddl Case Study: The Technical Arm Behind a California Agency | GritoWeb',
    },
    metaDescription: {
      pt: 'Como a GritoWeb virou o time de desenvolvimento WordPress da Griddl (Califórnia): temas Sage + Gutenberg, 90+ no PageSpeed e ~20 projetos entregues desde 2021.',
      en: "How GritoWeb became Griddl's WordPress development team (California): Sage + Gutenberg themes, 90+ PageSpeed, and ~20 projects delivered since 2021.",
    },
    year: 'Desde 2021',
    result: '~20 projetos entregues desde 2021',
    siteUrl: 'https://griddl.co/',
    sector: 'Estúdio criativo — Los Angeles, EUA',
    deliverables: 'Desenvolvimento WordPress white-label, manutenção mensal',
    duration: 'Parceria contínua desde 2021',
    accent: 'blue',
    challengeTitle: 'Cada um fazendo o que faz de *melhor*.',
    challengeBody: [
      'A Griddl é um estúdio criativo de Los Angeles especializado em design, branding e estratégia, com um carinho especial por negócios de impacto e organizações sem fins lucrativos. É design com propósito: cada decisão visual nasce de uma intenção de negócio. Mas todo projeto bonito precisa, em algum momento, virar código — e é exatamente nesse ponto que a nossa história começa.',
      'Conforme os projetos das clientes da Griddl cresciam, foi ficando natural ter um time técnico dedicado, capaz de levar o desenvolvimento ao mesmo patamar do design. Os primeiros sites rodavam em page builders (Elementor, Crocoblock) — uma escolha rápida e comum, mas que não acompanharia projetos cada vez mais ambiciosos em performance e manutenção no longo prazo.',
      'E tinha o ativo mais caro de qualquer dona de agência: o tempo. A Ana e a Maria precisavam estar onde elas brilham — na estratégia, na atração de clientes, no crescimento do negócio. Ter um parceiro de desenvolvimento de confiança é justamente o que libera esse foco.',
    ].join('\n\n'),
    processSteps: [
      {
        number: '01',
        title: 'O primeiro projeto',
        description:
          'A Maria nos encontrou, e o primeiro trabalho foi uma única página, ligada a uma publicação da Caltech. A gente entregou no capricho, no prazo, e o que era um freela virou confiança. Confiança virou contrato — firme desde 2021.',
      },
      {
        number: '02',
        title: 'A tecnologia inteira',
        description:
          'Hoje a GritoWeb cuida de praticamente toda a tomada de decisão técnica dos projetos da Griddl, entrando já nas primeiras fases pra ajudar a pensar a estratégia técnica que orienta a construção e apoia as decisões de design.',
      },
      {
        number: '03',
        title: 'De page builders a temas sob medida',
        description:
          'Levamos os projetos para temas WordPress construídos em Sage com blocos nativos do Gutenberg: performance que a gente controla, manutenção sã conforme o site cresce e um editor limpo e fácil pro cliente final.',
      },
      {
        number: '04',
        title: 'Manutenção mensal',
        description:
          'Atualização de plugins, backups e segurança de todos os sites. A Griddl não perde uma noite de sono com isso, porque é problema nosso.',
      },
    ],
    stats: [
      { value: '90+', label: 'no PageSpeed do Google nos novos temas Gutenberg' },
      { value: '~20', label: 'projetos entregues com sucesso desde 2021' },
      { value: '2021', label: 'início da parceria — firme até hoje' },
    ],
    stack: [
      'WordPress',
      'Sage (Roots)',
      'Blocos nativos do Gutenberg',
      'Manutenção mensal (atualizações, backups, segurança)',
    ],
    nextProjectHref: '/portfolio/bright-minds',
  },
  {
    slug: 'bright-minds',
    coverFile: 'capa-bright-minds.svg',
    coverAlt: 'Capa provisória do case Escola Bright Minds',
    client: 'Escola Bright Minds',
    title: { pt: 'Escola Bright Minds' },
    summary: { pt: 'O departamento de tecnologia por trás de uma escola online.' },
    metaTitle: {
      pt: 'Case Bright Minds: a operação de tecnologia de uma escola online | GritoWeb',
    },
    metaDescription: {
      pt: 'Como a GritoWeb cuida da tecnologia da Escola Bright Minds: landing pages em WordPress, automações de funil (N8N + Hotmart), gestão de EAD e infraestrutura na Cloudflare.',
    },
    result: 'Operação técnica de ponta a ponta',
    siteUrl: 'https://escolabrightminds.com.br/',
    sector: 'Educação online (EAD)',
    deliverables: 'Landing pages, automações, plataforma EAD, infraestrutura',
    duration: 'Parceria contínua',
    accent: 'orange',
    challengeTitle: 'A operação técnica, de *ponta a ponta*.',
    challengeBody: [
      'A Escola Bright Minds nasceu de uma ideia simples e ambiciosa: ensinar pra jovens, a partir dos 11 anos, o que costuma ficar de fora da grade tradicional — comunicação e oratória, economia, cidadania, pensamento crítico. Tudo num modelo de EAD pensado pra caber na rotina: aulas gravadas, encontros ao vivo, gamificação e material de apoio, na palma da mão.',
      'Numa escola online, a tecnologia não é um detalhe: é o que faz o negócio rodar. E ela tem várias frentes — a página que traz o aluno, as automações que organizam a venda, a plataforma onde ele estuda, a infraestrutura que segura tudo de pé.',
      'O conteúdo e o ensino são com a Bright Minds, e eles fazem isso muito bem. Colocar tudo isso no ar, fazer funcionar e manter girando é com a gente.',
    ].join('\n\n'),
    processSteps: [
      {
        number: '01',
        title: 'Landing pages',
        description:
          'Criação e manutenção das landing pages em WordPress com Elementor: páginas rápidas, bem construídas e prontas pra receber tráfego e converter, sem que a verba de anúncio escorra por uma página lenta. A gente entrega o palco; eles fazem o show.',
      },
      {
        number: '02',
        title: 'Automações e integrações',
        description:
          'As automações que conectam captura de leads, CRM e vendas, com um servidor N8N orquestrando a integração com a Hotmart. É a engrenagem que transforma interesse em aluno matriculado, funcionando dia e noite.',
      },
      {
        number: '03',
        title: 'Plataforma de ensino (EAD)',
        description:
          'Gestão e evolução da plataforma onde o aluno estuda: ajustes, melhorias e tudo que mantém a experiência fluida. Se a plataforma trava, o aluno sente — então a gente faz o que for preciso pra que ela não trave.',
      },
      {
        number: '04',
        title: 'Infraestrutura',
        description:
          'Gestão do VPS que roda as landing pages, dos serviços de e-mail e da camada de CDN e Firewall da Cloudflare. É o trabalho que ninguém nota quando está funcionando — e esse é exatamente o objetivo.',
      },
    ],
    stack: [
      'WordPress + Elementor',
      'N8N + Hotmart',
      'VPS + serviços de e-mail',
      'Cloudflare (CDN + Firewall)',
    ],
    nextProjectHref: '/portfolio/griddl',
  },
]

/**
 * Sobe a capa direto no R2 local e cria o registro de media com payload.db.create,
 * por baixo do adapter de storage. O caminho normal (payload.create + filePath)
 * estoura no proxy do miniflare, que rejeita Buffer no R2.put (workers-sdk#6047) —
 * mesmo contorno do sync-from-remote.ts: gravar como Blob.
 */
async function uploadCover(payload: Payload, R2: R2Bucket, item: Case): Promise<number> {
  const buf = readFileSync(join(COVERS_DIR, item.coverFile))
  await R2.put(item.coverFile, new Blob([buf]), {
    httpMetadata: { contentType: 'image/svg+xml' },
  })
  const media = await payload.db.create({
    collection: 'media',
    data: {
      alt: item.coverAlt,
      filename: item.coverFile,
      mimeType: 'image/svg+xml',
      filesize: buf.length,
      width: 1600,
      height: 1000,
    },
  })
  return media.id as number
}

/** Remove registros de capa provisória órfãos deixados por execuções que falharam. */
async function cleanupOrphanCovers(payload: Payload) {
  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { like: 'capa-' } },
    depth: 0,
    limit: 50,
  })
  for (const doc of docs) {
    const used = await payload.find({
      collection: 'portfolios',
      where: { image: { equals: doc.id } },
      depth: 0,
      limit: 1,
    })
    if (used.docs.length) continue
    await payload.db.deleteOne({ collection: 'media', where: { id: { equals: doc.id } } })
    console.log(`    − media órfã removida: ${doc.filename} (id ${doc.id})`)
  }
}

async function seedCase(payload: Payload, R2: R2Bucket, item: Case) {
  const { docs } = await payload.find({
    collection: 'portfolios',
    where: { slug: { equals: item.slug } },
    depth: 0,
    limit: 1,
  })
  if (docs.length) {
    console.log(`\n▸ "${item.slug}" já existe (id ${docs[0].id}) — pulando.`)
    return docs[0].id
  }

  console.log(`\n▸ "${item.title.pt}" → /portfolio/${item.slug}`)
  if (DRY_RUN) return null

  const coverId = await uploadCover(payload, R2, item)

  const created = await payload.create({
    collection: 'portfolios',
    locale: 'pt',
    depth: 0,
    data: {
      generateSlug: false,
      slug: item.slug,
      _status: 'published',
      title: item.title.pt,
      client: item.client,
      summary: item.summary.pt,
      image: coverId,
      accent: item.accent,
      tagVariant: item.accent,
      year: item.year,
      result: item.result,
      siteUrl: item.siteUrl,
      nextProjectHref: item.nextProjectHref,
      sector: item.sector,
      deliverables: item.deliverables,
      duration: item.duration,
      challengeTitle: item.challengeTitle,
      challengeBody: item.challengeBody,
      processSteps: item.processSteps,
      stats: item.stats,
      stack: item.stack.map((tool) => ({ tool })),
      meta: { title: item.metaTitle.pt, description: item.metaDescription.pt },
    } as never,
  })

  if (item.title.en) {
    await payload.update({
      collection: 'portfolios',
      id: created.id,
      locale: 'en',
      depth: 0,
      data: {
        _status: 'published',
        title: item.title.en,
        summary: item.summary.en,
        meta: { title: item.metaTitle.en, description: item.metaDescription.en },
      } as never,
    })
  }

  console.log(`    ✓ gravado (id ${created.id}${item.title.en ? ', PT + EN' : ', só PT'})`)
  return created.id
}

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION !== '1') {
    throw new Error(
      'Recusando rodar contra produção. Remova NODE_ENV=production, ou passe ALLOW_PRODUCTION=1 para confirmar que é intencional.',
    )
  }

  const payload = await getPayload({ config })
  const local = await getPlatformProxy<{ R2: R2Bucket }>({ remoteBindings: false })
  const R2 = (local.env as { R2: R2Bucket }).R2

  await cleanupOrphanCovers(payload)

  const ids: (number | string | null)[] = []
  for (const item of CASES) ids.push(await seedCase(payload, R2, item))

  // Relaciona um case ao outro (seção "projetos relacionados")
  if (!DRY_RUN && ids[0] && ids[1]) {
    await payload.update({
      collection: 'portfolios',
      id: ids[0],
      depth: 0,
      data: { relatedPortfolios: [ids[1]] } as never,
    })
    await payload.update({
      collection: 'portfolios',
      id: ids[1],
      depth: 0,
      data: { relatedPortfolios: [ids[0]] } as never,
    })
    console.log('\n    ✓ cases relacionados entre si')
  }

  await local.dispose()

  console.log(
    DRY_RUN ? '\nDRY: nada gravado.' : '\nPronto. Confira em http://localhost:3000/portfolio',
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
