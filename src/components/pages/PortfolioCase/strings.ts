// UI copy for the portfolio case page, keyed by locale. Translating is editing
// data here — no JSX changes. The locale set is defined by these keys.

export type PortfolioLocale = 'pt' | 'en'

export const strings = {
  pt: {
    portfolio: 'Portfólio',
    factClient: 'Cliente',
    factSector: 'Setor',
    factDeliverables: 'Entregas',
    factDuration: 'Duração',
    factSince: 'Desde',
    factStack: 'Stack',
    process: 'Processo',
    processTitle: 'Como fizemos',
    gallery: 'Galeria',
    galleryTitle: 'O que entregamos',
    results: 'Resultados',
    resultsA: 'O que ',
    resultsHighlight: 'aconteceu',
    resultsB: ' depois',
    keepExploring: 'Continue navegando',
    viewAll: 'Ver portfólio completo',
    nextCase: 'Próximo case',
  },
  en: {
    portfolio: 'Portfolio',
    factClient: 'Client',
    factSector: 'Sector',
    factDeliverables: 'Deliverables',
    factDuration: 'Duration',
    factSince: 'Since',
    factStack: 'Stack',
    process: 'Process',
    processTitle: 'How we did it',
    gallery: 'Gallery',
    galleryTitle: 'What we delivered',
    results: 'Results',
    resultsA: 'What ',
    resultsHighlight: 'happened',
    resultsB: ' after',
    keepExploring: 'Keep exploring',
    viewAll: 'View full portfolio',
    nextCase: 'Next case',
  },
} as const

// pt is prefix-less (route group), en carries the /en prefix in the URL.
export const basePath = (locale: PortfolioLocale) =>
  locale === 'en' ? '/en/portfolio' : '/portfolio'
