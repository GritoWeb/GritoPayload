/**
 * Conteúdo final da página Portfólio (PT + EN).
 * Fonte: ../claude/gritoweb/site/portfolio.md e portfolio-en.md.
 *
 *
 * Saem do layout atual: homeSectionStats (o conteúdo diz explicitamente "Sem StatsBand
 * aqui") e homeSectionContact (não existe no conteúdo final).
 *
 * ⚠️ Sem campo para: o estado vazio da listagem, o rótulo "Ver projeto" dos cards e o
 * rótulo "Todos" do filtro — todos hardcoded em PT no PortfolioListingClient.tsx, e por
 * isso aparecem em português também na rota /en.
 */
import type { Block, PageContent } from './types'

const hero = {
  pt: {
    type: 'defaultHero',
    eyebrow: 'Portfólio',
    heroTitle: '*Trabalhos* selecionados.',
    titleMaxWidth: 'none',
    heroDescription:
      'Projetos reais para empresas e agências, no Brasil e nos Estados Unidos. Do site institucional ao sistema de missão crítica.',
  },
  en: {
    type: 'defaultHero',
    eyebrow: 'Portfolio',
    heroTitle: '*Selected* work.',
    titleMaxWidth: 'none',
    heroDescription:
      'Real projects for businesses and agencies, in Brazil and the United States. From the institutional site to the mission-critical system.',
  },
}

// O conteúdo não dá eyebrow nem título para a listagem — o hero já cumpre esse papel, e
// os defaults do bloco ("Portfólio" / "*Projetos* que colocamos pra rodar") duplicariam.
// Gravamos vazio de propósito.
const listing = {
  pt: {
    blockType: 'portfolioListing',
    eyebrow: '',
    title: '',
    titleMaxWidth: 'none',
    showFilters: true,
    showViewToggle: true,
  },
  en: {
    blockType: 'portfolioListing',
    eyebrow: '',
    title: '',
    titleMaxWidth: 'none',
    showFilters: true,
    showViewToggle: true,
  },
}

const cta = {
  pt: {
    blockType: 'homeSectionCta',
    variant: 'blue',
    eyebrow: 'Próximo projeto',
    title: 'O próximo *case*\npode ser o seu.',
    titleMaxWidth: 'none',
    description: 'Conte o que você precisa. Retornamos com escopo, prazo e investimento.',
    cta1Label: 'Fale com a GritoWeb',
    cta1Href: '/contato',
    cta1Variant: 'primary',
    cta2Label: 'Ver serviços',
    cta2Href: '/servicos',
    cta2Variant: 'white',
  },
  en: {
    blockType: 'homeSectionCta',
    variant: 'blue',
    eyebrow: 'Next project',
    title: 'The next case\n*could be yours*.',
    titleMaxWidth: 'none',
    description: 'Tell us what you need. We come back with scope, timeline, and investment.',
    cta1Label: 'Talk to GritoWeb',
    cta1Href: '/contato',
    cta1Variant: 'primary',
    cta2Label: 'See services',
    cta2Href: '/servicos',
    cta2Variant: 'white',
  },
}

const meta = {
  pt: {
    title: 'Portfólio — Projetos de desenvolvimento web | GritoWeb',
    description:
      'Projetos selecionados da GritoWeb: sites em WordPress, e-commerce e sistemas sob medida para empresas e agências, no Brasil e nos Estados Unidos. 15+ anos de estrada.',
  },
  en: {
    title: 'Portfolio — Web development projects | GritoWeb',
    description:
      'Selected GritoWeb projects: WordPress websites, e-commerce and custom systems for businesses and agencies, in Brazil and the United States. 15+ years in the field.',
  },
}

export const portfolio: PageContent = {
  slug: 'portfolio',
  passthroughBlocks: [],
  build: (locale) => ({
    hero: hero[locale],
    meta: meta[locale],
    layout: [listing[locale], cta[locale]] as Block[],
  }),
}
