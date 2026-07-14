/**
 * Conteúdo final da página Serviços (PT + EN).
 * Fonte: ../claude/gritoweb/site/servicos.md e services-en.md.
 *
 * Ver scripts/content/types.ts para as regras do formato (PT e EN precisam ter a mesma
 * forma; o runner casa os dois pela posição para reaproveitar os IDs).
 *
 * Saem do layout atual: homeSectionCta e homeSectionContact (não existem no conteúdo
 * final — e-mail/telefone migraram para contactSection.channels).
 */
import type { Block, PageContent } from './types'
import { CHANNELS, LOREM_CTA, LOREM_FEATURES, PLACEHOLDER_IMAGE, STATS } from './_placeholders'

const hero = {
  pt: {
    type: 'defaultHero',
    eyebrow: 'Sites · E-commerce · Sistemas',
    heroTitle: 'Desenvolvimento web para negócios\nque *dependem dele*.',
    titleMaxWidth: 'none',
    heroDescription:
      'Do site institucional ao sistema que roda a operação. Mais de 15 anos desenvolvendo no Brasil e nos Estados Unidos, com performance e segurança em cada projeto.',
    cta1Label: 'Fale com a GritoWeb',
    cta1Href: '/contato',
    cta2Label: 'Ver os serviços',
    // Âncora morta: nenhum bloco emite id= no HTML hoje. Richard vai ajustar os links.
    cta2Href: '#servicos',
  },
  en: {
    type: 'defaultHero',
    eyebrow: 'Websites · E-commerce · Systems',
    heroTitle: 'Web development for businesses\nthat *depend on it*.',
    titleMaxWidth: 'none',
    heroDescription:
      'From the institutional website to the system that runs the operation. More than 15 years building in Brazil and the United States, with performance and security on every project.',
    cta1Label: 'Talk to GritoWeb',
    cta1Href: '/contato',
    cta2Label: 'See the services',
    cta2Href: '#servicos',
  },
}

// ── Seção 2 — O problema ─────────────────────────────────────────────────────
// Só eyebrow + título + corpo no conteúdo. image/features/cta são LOREM.
const problem = {
  pt: {
    blockType: 'homeSectionAbout',
    eyebrow: 'Por que a escolha importa',
    title: 'Um site mal desenvolvido\n*custa caro* depois.',
    titleMaxWidth: 'none',
    description:
      'Site é fácil de começar e difícil de sustentar.\n\nO que trava seis meses depois quase nunca estava no orçamento: a página lenta que perde a venda, o plugin que quebra na atualização, a brecha que ninguém viu.\n\nA GritoWeb desenvolve para durar. Entendemos o problema antes de escolher a tecnologia, escrevemos código que envelhece bem e respondemos pela entrega depois que o site entra no ar.',
    image: PLACEHOLDER_IMAGE,
    features: LOREM_FEATURES.pt,
    ...LOREM_CTA.pt,
  },
  en: {
    blockType: 'homeSectionAbout',
    eyebrow: 'Why the choice matters',
    title: 'A poorly built website\n*costs you* later.',
    titleMaxWidth: 'none',
    description:
      'A website is easy to start and hard to sustain.\n\nWhat breaks six months later almost never showed up in the budget: the slow page that loses the sale, the plugin that breaks on an update, the security gap no one saw.\n\nGritoWeb builds to last. We understand the problem before choosing the technology, we write code that ages well, and we stand behind the delivery after the site goes live.',
    image: PLACEHOLDER_IMAGE,
    features: LOREM_FEATURES.en,
    ...LOREM_CTA.en,
  },
}

// ── Seção 3 — Serviços ───────────────────────────────────────────────────────
// O bloco não tem CTA de seção; o "Não sabe por onde começar?" do conteúdo não cabe
// como rótulo de botão e foi descartado. Os CTAs por card apontam para /contato.
const services = {
  pt: {
    blockType: 'homeSectionServices',
    eyebrow: 'O que fazemos',
    title: 'Serviços que cobrem\no *projeto inteiro*.',
    titleMaxWidth: 'none',
    description:
      'Escolhemos a tecnologia pelo que o projeto precisa entregar. O próprio site da GritoWeb roda em PayloadCMS, e desenvolvemos de WordPress a sistemas do zero.',
    services: [
      {
        name: 'WordPress sob medida',
        variant: 'blue',
        iconType: 'globe',
        description:
          'Tema do zero, sem construtor pesado e sem pilha de plugin. Sete anos especializados em WordPress, sobre mais de 15 de desenvolvimento web: um site que carrega rápido e sobrevive às atualizações.',
        ctaLabel: 'Falar sobre o projeto',
        ctaHref: '/contato',
      },
      {
        name: 'E-commerce',
        variant: 'orange',
        iconType: 'cart',
        description:
          'Lojas que aguentam volume e continuam rápidas no pico de venda, integradas a pagamento, frete e estoque. Loja lenta perde carrinho no meio da compra; performance aqui é parte do produto.',
        ctaLabel: 'Falar sobre o projeto',
        ctaHref: '/contato',
      },
      {
        name: 'Landing Pages',
        variant: 'blue',
        iconType: 'landing',
        description:
          'Páginas de campanha feitas para uma única ação e medidas do primeiro clique à conversão. Carregam rápido porque não carregam peso morto, prontas para tráfego pago sem estourar o custo por lead.',
        ctaLabel: 'Falar sobre o projeto',
        ctaHref: '/contato',
      },
      {
        name: 'UX/UI',
        variant: 'orange',
        iconType: 'screen',
        description:
          'Interfaces desenhadas a partir do comportamento de quem usa, não de achismo. Menos ruído, um caminho evidente até a ação que importa, e design pensado para quem vai desenvolver e manter depois.',
        ctaLabel: 'Falar sobre o projeto',
        ctaHref: '/contato',
      },
      {
        name: 'Branding',
        variant: 'blue',
        iconType: 'brand',
        description:
          'Identidade visual coerente, do logo ao sistema de design que sustenta site e campanha. A marca chega pronta para virar produto digital, com componentes e regras claras — não um PDF que ninguém aplica.',
        ctaLabel: 'Falar sobre o projeto',
        ctaHref: '/contato',
      },
      {
        name: 'Sistemas e Plataformas',
        variant: 'orange',
        iconType: 'code',
        description:
          'Sistemas do zero, para grande volume de dados e muitas integrações de API: painéis, áreas logadas e conexões com o CRM e o ERP que o negócio já usa. Quando a ferramenta pronta não dá conta, desenvolvemos a que dá.',
        ctaLabel: 'Falar sobre o projeto',
        ctaHref: '/contato',
      },
    ],
  },
  en: {
    blockType: 'homeSectionServices',
    eyebrow: 'What we do',
    title: 'Services that cover\nthe *entire project*.',
    titleMaxWidth: 'none',
    description:
      "We choose the technology by what the project needs to deliver. GritoWeb's own site runs on PayloadCMS, and we build everything from WordPress to systems from scratch.",
    services: [
      {
        name: 'Custom WordPress',
        variant: 'blue',
        iconType: 'globe',
        description:
          "A theme built from scratch, no heavy page builder and no plugin stack. Seven years specialized in WordPress, on top of more than 15 in web development: a site that loads fast and survives updates.",
        ctaLabel: 'Talk about the project',
        ctaHref: '/contato',
      },
      {
        name: 'E-commerce',
        variant: 'orange',
        iconType: 'cart',
        description:
          'Stores that handle volume and stay fast at the sales peak, integrated with payment, shipping and inventory. A slow store loses the cart mid-purchase; performance here is part of the product.',
        ctaLabel: 'Talk about the project',
        ctaHref: '/contato',
      },
      {
        name: 'Landing Pages',
        variant: 'blue',
        iconType: 'landing',
        description:
          'Campaign pages built for a single action and measured from the first click to conversion. They load fast because they carry no dead weight, ready for paid traffic without driving up the cost per lead.',
        ctaLabel: 'Talk about the project',
        ctaHref: '/contato',
      },
      {
        name: 'UX/UI',
        variant: 'orange',
        iconType: 'screen',
        description:
          'Interfaces designed from the behavior of the people who use them, not from guesswork. Less noise, an obvious path to the action that matters, and design made for whoever will build and maintain it later.',
        ctaLabel: 'Talk about the project',
        ctaHref: '/contato',
      },
      {
        name: 'Branding',
        variant: 'blue',
        iconType: 'brand',
        description:
          'A coherent visual identity, from the logo to the design system that supports the website and the campaigns. The brand arrives ready to become a digital product, with clear components and rules — not a PDF no one applies.',
        ctaLabel: 'Talk about the project',
        ctaHref: '/contato',
      },
      {
        name: 'Systems and Platforms',
        variant: 'orange',
        iconType: 'code',
        description:
          "Systems from scratch, for large data volumes and many API integrations: dashboards, logged-in areas and connections with the CRM and the ERP the business already uses. When the off-the-shelf tool can't cope, we build the one that can.",
        ctaLabel: 'Talk about the project',
        ctaHref: '/contato',
      },
    ],
  },
}

// ── Seção 4 — Prova ──────────────────────────────────────────────────────────
// Só eyebrow + título + corpo no conteúdo. image/features/cta são LOREM.
const proof = {
  pt: {
    blockType: 'homeSectionAbout',
    eyebrow: 'Por que a GritoWeb',
    title: 'Mais de 15 anos\n*respondendo pela entrega*.',
    titleMaxWidth: 'none',
    description:
      'Experiência aqui não é número na parede. Em mais de 15 anos, a GritoWeb entregou mais de 120 projetos para empresas no Brasil e nos Estados Unidos, incluindo trabalhos para governos americanos.\n\nO maior cuidado do nosso trabalho é o que não aparece: código limpo, poucos plugins, segurança e manutenção. É o que faz um site carregar rápido, resistir a ataque e durar anos sem retrabalho.',
    image: PLACEHOLDER_IMAGE,
    features: LOREM_FEATURES.pt,
    ...LOREM_CTA.pt,
  },
  en: {
    blockType: 'homeSectionAbout',
    eyebrow: 'Why GritoWeb',
    title: 'More than 15 years\n*standing behind the delivery*.',
    titleMaxWidth: 'none',
    description:
      "Experience here is not a number on the wall. In more than 15 years, GritoWeb has delivered more than 120 projects for companies in Brazil and the United States, including work for US governments.\n\nThe greatest care in our work is what doesn't show: clean code, few plugins, security and maintenance. It's what makes a site load fast, withstand attacks and last for years without rework.",
    image: PLACEHOLDER_IMAGE,
    features: LOREM_FEATURES.en,
    ...LOREM_CTA.en,
  },
}

// ── Seção 5 — Como trabalhamos ───────────────────────────────────────────────
const process = {
  pt: {
    blockType: 'homeSectionProcess',
    background: 'dark',
    eyebrow: 'O processo',
    title: 'Quatro etapas, do *briefing ao ar*.',
    titleMaxWidth: 'none',
    description:
      'Um método claro para não deixar decisão importante para a última hora, e para você saber, a cada etapa, o que esperar de nós.',
    highlightIndex: 2,
    steps: [
      {
        title: 'Descobrir',
        description:
          'Entendemos o negócio, o público e o problema real antes de escrever qualquer linha de código. É a etapa que evita desenvolver a coisa errada com esmero.',
      },
      {
        title: 'Planejar',
        description:
          'Escopo, arquitetura e a tecnologia certa para o projeto. É aqui que se decide o que vai durar e o que vai custar, por escrito, antes de começar.',
      },
      {
        title: 'Desenvolver',
        description:
          'Código limpo, poucos plugins e testes. A parte que não aparece na tela, mas que segura tudo quando o site cresce e recebe carga de verdade.',
      },
      {
        title: 'Decolar',
        description:
          'Publicação, ajuste fino de performance e acompanhamento depois do lançamento. Entrar no ar é o começo da vida do projeto, não o fim do nosso trabalho.',
      },
    ],
  },
  en: {
    blockType: 'homeSectionProcess',
    background: 'dark',
    eyebrow: 'The process',
    title: 'Four stages, from *briefing to launch*.',
    titleMaxWidth: 'none',
    description:
      'A clear method so no important decision is left to the last minute, and so you know, at each stage, what to expect from us.',
    highlightIndex: 2,
    steps: [
      {
        title: 'Discover',
        description:
          'We understand the business, the audience and the real problem before writing a single line of code. It is the stage that keeps us from building the wrong thing with great care.',
      },
      {
        title: 'Plan',
        description:
          'Scope, architecture and the right technology for the project. This is where what will last and what will cost is decided, in writing, before we start.',
      },
      {
        title: 'Build',
        description:
          'Clean code, few plugins and tests. The part that does not show on screen, but that holds everything together when the site grows and takes real load.',
      },
      {
        title: 'Launch',
        description:
          "Publishing, performance fine-tuning and follow-up after the launch. Going live is the beginning of the project's life, not the end of our work.",
      },
    ],
  },
}

// ── Seção 6 — O diferencial ──────────────────────────────────────────────────
// Nota: é o mesmo manifesto já publicado na home. Duplicação vinda do conteúdo.
const quote = {
  pt: {
    blockType: 'pullQuote',
    quote:
      'Desenvolvimento não é instalar uma ferramenta pronta e esperar que funcione. É entender o problema, escolher a arquitetura certa e responder pela entrega depois que o site entra no ar.',
  },
  en: {
    blockType: 'pullQuote',
    quote:
      'Development is not installing a ready-made tool and hoping it works. It is understanding the problem, choosing the right architecture and standing behind the delivery after the site goes live.',
  },
}

// ── Seção 7 — CTA final ──────────────────────────────────────────────────────
// A linha de apoio do conteúdo ("Conte o que você precisa…") não tem campo: o bloco
// só tem eyebrow + heading. Os campos extras do formulário (Empresa, Tipo de projeto,
// Faixa de investimento) exigem mudança de código — tarefa separada.
const contact = {
  pt: {
    blockType: 'contactSection',
    eyebrow: 'Contato',
    heading: 'Vamos conversar sobre o seu próximo projeto.',
    sidebarEyebrow: 'Fale direto',
    successTitle: 'Mensagem enviada',
    successMessage: 'Recebemos sua mensagem. Retornamos com escopo, prazo e investimento.',
    channels: CHANNELS.pt,
  },
  en: {
    blockType: 'contactSection',
    eyebrow: 'Contact',
    heading: "Let's talk about your next project.",
    sidebarEyebrow: 'Reach us directly',
    successTitle: 'Message sent',
    successMessage: 'We got your message. We come back with scope, timeline and investment.',
    channels: CHANNELS.en,
  },
}

const meta = {
  pt: {
    title: 'Serviços de desenvolvimento web | WordPress, e-commerce e sistemas | GritoWeb',
    description:
      'Desenvolvimento web sob medida: WordPress, e-commerce, landing pages, UX/UI, branding e sistemas do zero. Mais de 15 anos, +120 projetos, Brasil e EUA.',
  },
  en: {
    title: 'Web development services | WordPress, e-commerce and systems | GritoWeb',
    description:
      'Custom web development: WordPress, e-commerce, landing pages, UX/UI, branding and systems from scratch. More than 15 years, 120+ projects, Brazil and the US.',
  },
}

export const servicos: PageContent = {
  slug: 'servicos',
  passthroughBlocks: [],
  build: (locale) => ({
    hero: hero[locale],
    meta: meta[locale],
    layout: [
      problem[locale],
      services[locale],
      proof[locale],
      STATS[locale],
      process[locale],
      quote[locale],
      contact[locale],
    ] as Block[],
  }),
}
