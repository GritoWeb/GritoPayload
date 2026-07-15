/**
 * Conteúdo final da Home (PT + EN).
 * Fonte: ../claude/gritoweb/site/home.md e home-en.md (revisão de 2026-07-11).
 *
 * Ver scripts/content/types.ts para as regras do formato (PT e EN precisam ter a mesma
 * forma; o runner casa os dois pela posição para reaproveitar os IDs).
 *
 * O marcador *palavra* pinta a palavra de laranja no front. \n quebra linha.
 *
 * Fora desta versão do conteúdo (removidos da página): SectionLogoCloud e LatestPosts.
 * As duas seções "sobre" foram FUNDIDAS pelo cliente: a antiga "O que sustenta o trabalho"
 * ("Nosso padrão") foi absorvida pelo "Quem somos", que subiu para a posição 3.
 *
 * Trechos do conteúdo SEM campo no bloco correspondente — não foram gravados:
 *  - a linha de apoio do ChecklistGrid (S4) — o bloco só tem eyebrow + título + itens;
 *  - o parágrafo de apoio do PullQuote (S8) — o bloco só tem eyebrow/quote/author/role;
 *  - os links dos mini-cards da S3 (/servicos e /agencias) — a linha de feature não tem href;
 *  - o CTA de seção dos Serviços (S5) — o bloco só tem CTA por card.
 */
import type { Block, PageContent } from './types'
import { CHANNELS, PLACEHOLDER_IMAGE, STATS } from './_placeholders'

/** Depoimentos: o conteúdo (S8b) diz que a prova é PLACEHOLDER e virá depois. Bloco preservado. */
const PASSTHROUGH_BLOCKS = ['homeSectionTestimonials'] as const

// ── Seção 1 — Hero ───────────────────────────────────────────────────────────
// Revisão de copy 2026-07-14. Três decisões que quebram as regras antigas do
// 01-voz-do-site.md (o doc foi atualizado junto):
//  - SEM eyebrow. Na pesquisa de referências, eyebrow é minoria e nunca é menu de serviço.
//    O HeroSection só renderiza o <p> se houver valor, então string vazia basta.
//  - O tempo de casa subiu para o H1 (o molde antigo mandava credibilidade para o apoio).
//    Nenhuma agência brasileira da pesquisa ocupa esse espaço.
//  - O H1 anterior ("o seu negócio crescer") saiu pelo duplo sentido.
const hero = {
  pt: {
    type: 'defaultHero',
    eyebrow: '',
    heroTitle: 'Desenvolvimento de sites e sistemas sob medida, *há mais de 15 anos.*',
    titleMaxWidth: 'none',
    heroDescription:
      'Soluções escaláveis que sustentam a operação de empresas no Brasil e nos Estados Unidos. Performance e segurança em cada projeto.',
    cta1Label: 'Fale com a GritoWeb',
    cta1Href: '/contato',
    cta2Label: 'Ver serviços',
    cta2Href: '/servicos',
  },
  en: {
    type: 'defaultHero',
    eyebrow: '',
    heroTitle: 'Building custom websites and systems for *more than 15 years.*',
    titleMaxWidth: 'none',
    heroDescription:
      'Scalable solutions that keep businesses running, in Brazil and the United States. Performance and security on every project.',
    cta1Label: 'Talk to GritoWeb',
    cta1Href: '/contato',
    cta2Label: 'See services',
    cta2Href: '/servicos',
  },
}

// ── Seção 4 — Por que a GritoWeb ─────────────────────────────────────────────
// Títulos de RESULTADO (benefício ao cliente), não rótulo de feature. Enquadramento
// sempre positivo: o conteúdo proíbe condenar terceirização. O item 6 deixou de citar
// prazo fixo de suporte — o doc determina que os termos variam por contrato.
const why = {
  pt: {
    blockType: 'checklistGrid',
    eyebrow: 'Diferenciais',
    title: 'Por que *confiam* na GritoWeb.',
    titleMaxWidth: 'none',
    items: [
      {
        title: 'Fale direto com quem faz',
        description:
          'Do briefing ao go-live, você trata com o time que escreve o código. O contexto não se perde no caminho.',
      },
      {
        title: 'Receba no prazo combinado',
        description:
          'Cronograma feito com a realidade do projeto, não com a ansiedade da venda. Combinou, cumpriu.',
      },
      {
        title: 'Saiba o que está pagando',
        description:
          'Escopo, prazo e investimento por escrito, sem letra miúda, em linguagem que dá pra entender.',
      },
      {
        title: 'Tenha um site que não quebra',
        description:
          'Código limpo, poucos plugins e segurança de verdade. Não quebra na primeira atualização.',
      },
      {
        title: 'Tenha a tecnologia certa pro seu caso',
        description:
          'Escolhemos a stack pelo que o projeto precisa entregar, não pela que é mais fácil pra nós.',
      },
      {
        title: 'Não fique na mão depois da entrega',
        description:
          'O trabalho não acaba na publicação. Continuamos por perto para os ajustes que aparecem depois que o site entra no ar.',
      },
    ],
  },
  en: {
    blockType: 'checklistGrid',
    eyebrow: 'What sets us apart',
    title: 'Why clients *trust* GritoWeb.',
    titleMaxWidth: 'none',
    items: [
      {
        title: 'Talk straight to the people building it',
        description:
          "From briefing to go-live, you deal with the team writing the code. Context doesn't get lost along the way.",
      },
      {
        title: 'Get it on the agreed deadline',
        description:
          'A timeline set by the reality of the project, not the anxiety of the sale. Agreed is delivered.',
      },
      {
        title: "Know what you're paying for",
        description:
          'Scope, timeline, and investment in writing, no fine print, in language you can actually understand.',
      },
      {
        title: "Get a site that doesn't break",
        description:
          "Clean code, few plugins, and real security. It won't break on the first update.",
      },
      {
        title: 'Get the right technology for your case',
        description:
          "We choose the stack by what the project needs to deliver, not by what's easiest for us.",
      },
      {
        title: "Don't get left hanging after launch",
        description:
          "The work doesn't end at publishing. We stay close for the adjustments that come up once the site is live.",
      },
    ],
  },
}

// ── Seção 3 — Quem somos ─────────────────────────────────────────────────────
// Seção "sobre" única da home: absorveu a antiga "O que sustenta o trabalho". Os
// mini-cards viram as `features`. Os links dos mini-cards (/servicos, /agencias) não
// têm campo na linha de feature e ficaram de fora.
//
// Revisão de copy 2026-07-14:
//  - "estúdio" → "agência" (decisão do Richard; também é o termo que o público busca).
//  - WordPress passa a ser nomeado como ESPECIALIDADE aqui. Continua fora do hero: a regra
//    "ferramenta fora" virou regra só da porta de entrada, não da página inteira.
//  - "aplicações sob medida", nunca "mobile": a experiência em mobile é menor.
//  - "O padrão de trabalho é o mesmo em todos" existe para que grandes marcas e governo
//    soem como PROVA DE PADRÃO e não como filtro de cliente. Médio porte é público-alvo.
const whoWeAre = {
  pt: {
    blockType: 'homeSectionAbout',
    eyebrow: 'Quem somos',
    title: 'Um time técnico para *empresas e agências.*',
    titleMaxWidth: 'none',
    description:
      'A GritoWeb é uma agência de desenvolvimento web. Somos especialistas em WordPress e em aplicações sob medida, com experiência que vai de empresas em crescimento a grandes marcas e órgãos governamentais. O padrão de trabalho é o mesmo em todos.\n\nTrabalhamos com padrões de qualidade rigorosos, porque o produto precisa resolver um problema real, não apenas parecer bonito na entrega. Segurança e robustez não são negociáveis: desenvolvemos soluções duradouras, que exigem pouca manutenção.',
    ctaLabel: 'Conheça a GritoWeb',
    ctaHref: '/sobre',
    image: PLACEHOLDER_IMAGE,
    features: [
      {
        title: 'Para empresas',
        description:
          'Site, e-commerce ou sistema sob medida, do briefing ao suporte pós-lançamento. Para negócios que levam o digital a sério e querem uma base que aguenta crescer.',
      },
      {
        title: 'Para agências',
        description:
          'O braço técnico de desenvolvimento da sua agência, em white label. Sua marca na entrega; a GritoWeb fica no bastidor. O cliente final nem percebe.',
      },
    ],
  },
  en: {
    blockType: 'homeSectionAbout',
    eyebrow: 'Who we are',
    title: 'A technical team for *businesses and agencies.*',
    titleMaxWidth: 'none',
    description:
      'GritoWeb is a web development agency. We specialize in WordPress and in custom applications, with experience ranging from growing businesses to major brands and government bodies. The standard of work is the same for all of them.\n\nWe work to rigorous quality standards, because the product has to solve a real problem, not just look good on delivery day. Security and robustness are not negotiable: we build lasting solutions that require little maintenance.',
    ctaLabel: 'About GritoWeb',
    ctaHref: '/sobre',
    image: PLACEHOLDER_IMAGE,
    features: [
      {
        title: 'For businesses',
        description:
          'A site, e-commerce, or custom system, from briefing to post-launch support. For businesses that take digital seriously and want a foundation that can handle growth.',
      },
      {
        title: 'For agencies',
        description:
          "Your agency's technical development arm, white label. Your brand on the delivery; GritoWeb stays backstage. The end client never notices.",
      },
    ],
  },
}

// ── Seção 6 — Serviços ───────────────────────────────────────────────────────
// WordPress é UM item, sem framing de especialidade. "Integrações de API" e "Manutenção"
// não têm ícone no enum: reusamos `code` e `screen` (Richard ajusta depois).
const services = {
  pt: {
    blockType: 'homeSectionServices',
    eyebrow: 'O que fazemos',
    title: 'Do site institucional ao\n*sistema sob medida*.',
    titleMaxWidth: 'none',
    description:
      'Desenvolvemos em mais de uma stack e escolhemos a tecnologia pelo que o projeto precisa entregar. O próprio site da GritoWeb roda em PayloadCMS, não na ferramenta que a maioria esperaria.',
    services: [
      {
        name: 'Sites e plataformas em WordPress',
        variant: 'blue',
        iconType: 'globe',
        description:
          'Tema próprio, código que envelhece bem e a segurança que um site profissional exige. Sem pilha de plugin: só o necessário, bem feito.',
        ctaLabel: 'Ver todos os serviços',
        ctaHref: '/servicos',
      },
      {
        name: 'E-commerce',
        variant: 'orange',
        iconType: 'cart',
        description:
          'Lojas que aguentam volume, integram pagamento e estoque, e continuam rápidas no pico de venda.',
        ctaLabel: 'Ver todos os serviços',
        ctaHref: '/servicos',
      },
      {
        name: 'Landing Pages',
        variant: 'blue',
        iconType: 'landing',
        description:
          'Páginas de campanha construídas para carregar rápido e converter. Foco em uma ação, medida do começo ao fim.',
        ctaLabel: 'Ver todos os serviços',
        ctaHref: '/servicos',
      },
      {
        name: 'Sistemas e plataformas sob medida',
        variant: 'orange',
        iconType: 'code',
        description:
          'Sistemas desenvolvidos do zero para grande volume de dados e muitas integrações de API. Quando a ferramenta pronta não dá conta, nós desenvolvemos a que dá.',
        ctaLabel: 'Ver todos os serviços',
        ctaHref: '/servicos',
      },
      {
        name: 'Integrações de API',
        variant: 'blue',
        iconType: 'code', // reuso: não há ícone de "API" no enum
        description:
          'Conexão entre o site e os sistemas que o negócio já usa: CRM, ERP, pagamento e plataformas de dados.',
        ctaLabel: 'Ver todos os serviços',
        ctaHref: '/servicos',
      },
      {
        name: 'Manutenção e suporte técnico',
        variant: 'orange',
        iconType: 'screen', // reuso: não há ícone de "manutenção" no enum
        description:
          'Acompanhamento depois do lançamento: performance, segurança e atualizações, para o site não parar de evoluir no dia em que entra no ar.',
        ctaLabel: 'Ver todos os serviços',
        ctaHref: '/servicos',
      },
    ],
  },
  en: {
    blockType: 'homeSectionServices',
    eyebrow: 'What we do',
    title: 'From the institutional site to the\n*custom system*.',
    titleMaxWidth: 'none',
    description:
      "We develop on more than one stack and choose the technology by what the project needs to deliver. GritoWeb's own site runs on PayloadCMS, not the tool most people would expect.",
    services: [
      {
        name: 'Sites and platforms in WordPress',
        variant: 'blue',
        iconType: 'globe',
        description:
          'A bespoke theme, code that ages well, and the security a professional site demands. No stack of plugins: only what is needed, done well.',
        ctaLabel: 'See all services',
        ctaHref: '/servicos',
      },
      {
        name: 'E-commerce',
        variant: 'orange',
        iconType: 'cart',
        description:
          'Stores that handle volume, integrate payment and inventory, and stay fast at the sales peak.',
        ctaLabel: 'See all services',
        ctaHref: '/servicos',
      },
      {
        name: 'Landing Pages',
        variant: 'blue',
        iconType: 'landing',
        description:
          'Campaign pages built to load fast and convert. Focused on a single action, measured from start to finish.',
        ctaLabel: 'See all services',
        ctaHref: '/servicos',
      },
      {
        name: 'Custom systems and platforms',
        variant: 'orange',
        iconType: 'code',
        description:
          'Systems built from scratch for large volumes of data and many API integrations. When the off-the-shelf tool cannot handle it, we build the one that can.',
        ctaLabel: 'See all services',
        ctaHref: '/servicos',
      },
      {
        name: 'API integrations',
        variant: 'blue',
        iconType: 'code',
        description:
          'Connecting the site to the systems the business already uses: CRM, ERP, payment, and data platforms.',
        ctaLabel: 'See all services',
        ctaHref: '/servicos',
      },
      {
        name: 'Maintenance and technical support',
        variant: 'orange',
        iconType: 'screen',
        description:
          'Follow-up after launch: performance, security, and updates, so the site does not stop evolving the day it goes live.',
        ctaLabel: 'See all services',
        ctaHref: '/servicos',
      },
    ],
  },
}

// ── Seção 7 — Como trabalhamos ───────────────────────────────────────────────
const process = {
  pt: {
    blockType: 'homeSectionProcess',
    background: 'dark',
    eyebrow: 'O processo',
    title: 'Quatro etapas, do *briefing ao ar*.',
    titleMaxWidth: 'none',
    description: 'Um método claro para não deixar decisão importante para a última hora.',
    highlightIndex: 2,
    steps: [
      {
        title: 'Descobrir',
        description:
          'Entendemos o negócio, o público e o problema real antes de escrever qualquer linha de código.',
      },
      {
        title: 'Planejar',
        description:
          'Escopo, arquitetura e a tecnologia certa para o projeto. É aqui que se decide o que vai durar.',
      },
      {
        title: 'Desenvolver',
        description:
          'Código limpo, poucos plugins e testes. A parte que não aparece, mas que segura tudo.',
      },
      {
        title: 'Decolar',
        description:
          'Publicação, ajuste fino de performance e acompanhamento depois do lançamento.',
      },
    ],
  },
  en: {
    blockType: 'homeSectionProcess',
    background: 'dark',
    eyebrow: 'The process',
    title: 'Four stages, from *briefing to launch*.',
    titleMaxWidth: 'none',
    description: 'A clear method so no important decision is left to the last minute.',
    highlightIndex: 2,
    steps: [
      {
        title: 'Discover',
        description:
          'We understand the business, the audience, and the real problem before writing a single line of code.',
      },
      {
        title: 'Plan',
        description:
          'Scope, architecture, and the right technology for the project. This is where what will last gets decided.',
      },
      {
        title: 'Build',
        description:
          'Clean code, few plugins, and testing. The part that does not show, but holds everything together.',
      },
      { title: 'Launch', description: 'Publishing, fine-tuning performance, and follow-up after launch.' },
    ],
  },
}

// ── Seção 8a — Case em destaque ──────────────────────────────────────────────
// O conteúdo diz que o case é PLACEHOLDER e virá do CMS. LatestPortfolios puxa os cases
// reais cadastrados — nada é inventado aqui.
const portfolio = {
  pt: {
    blockType: 'latestPortfolios',
    eyebrow: 'Case',
    title: '*Trabalhos* selecionados.',
    titleMaxWidth: 'none',
    buttonLabel: 'Ver o portfólio completo',
    buttonHref: '/portfolio',
  },
  en: {
    blockType: 'latestPortfolios',
    eyebrow: 'Case',
    title: '*Selected* work.',
    titleMaxWidth: 'none',
    buttonLabel: 'See the full portfolio',
    buttonHref: '/portfolio',
  },
}

// ── Seção 8 — O diferencial ──────────────────────────────────────────────────
// Manifesto da marca: sem autor, sem atribuição. O campo `body` foi adicionado ao bloco
// para caber os dois parágrafos desta versão do conteúdo — renderizados na MESMA
// tipografia da citação. O CTA opcional que o conteúdo sugere não foi implementado.
const quote = {
  pt: {
    blockType: 'pullQuote',
    quote: 'Fazer um site, qualquer um faz. Fazer um que não te deixa na mão, poucos.',
    body: 'A diferença não aparece no dia da entrega. Aparece meses depois: quando o site continua rápido e seguro, em vez de começar a dar problema atrás de problema.',
  },
  en: {
    blockType: 'pullQuote',
    quote: "Anyone can build a website. Building one that won't let you down — few can.",
    body: "The difference doesn't show on delivery day. It shows months later: when the site is still fast and secure, instead of throwing one problem after another.",
  },
}

// ── Seção 10 — CTA final ─────────────────────────────────────────────────────
// A linha de apoio não tem campo (o bloco só tem eyebrow + heading). Os campos extras do
// formulário (Empresa, Tipo de projeto, Faixa de investimento) exigem código — pendente.
const contact = {
  pt: {
    blockType: 'contactSection',
    eyebrow: 'Contato',
    heading: 'Vamos conversar sobre o seu próximo projeto.',
    sidebarEyebrow: 'Fale direto',
    successTitle: 'Mensagem enviada',
    successMessage: 'Recebemos sua mensagem. Retornamos com escopo, prazo e investimento.',
    channels: [
      ...CHANNELS.pt,
      { icon: 'location', label: 'Local', value: 'Sorocaba/SP' },
    ],
  },
  en: {
    blockType: 'contactSection',
    eyebrow: 'Contact',
    heading: "Let's talk about your next project.",
    sidebarEyebrow: 'Reach us directly',
    successTitle: 'Message sent',
    successMessage: 'We got your message. We come back with scope, timeline, and investment.',
    channels: [
      ...CHANNELS.en,
      { icon: 'location', label: 'Location', value: 'Sorocaba/SP' },
    ],
  },
}

const meta = {
  pt: {
    title: 'GritoWeb — Desenvolvimento web e sistemas sob medida',
    description:
      'Desenvolvimento web e sistemas sob medida, com performance, segurança e suporte que responde. 15+ anos de estrada, clientes no Brasil e nos Estados Unidos.',
  },
  en: {
    title: 'GritoWeb — Web development and custom systems',
    description:
      'Web development and custom systems, with performance, security, and support that answers. 15+ years in the field, clients in Brazil and the United States.',
  },
}

/** '@blockType' = bloco preservado, injetado pelo runner. */
const ORDER = [
  'stats',
  'whoWeAre',
  'why',
  'services',
  'process',
  'portfolio',
  '@homeSectionTestimonials', // S7b — prova social, conteúdo final ainda por vir
  'quote',
  'contact',
] as const

const layout = { stats: STATS, whoWeAre, why, services, process, portfolio, quote, contact }

export const home: PageContent = {
  slug: 'home',
  passthroughBlocks: PASSTHROUGH_BLOCKS,
  build: (locale, passthrough) => ({
    hero: hero[locale],
    meta: meta[locale],
    layout: ORDER.map((key) =>
      key.startsWith('@')
        ? passthrough[key.slice(1)]
        : layout[key as keyof typeof layout][locale],
    ).filter(Boolean) as Block[],
  }),
}
