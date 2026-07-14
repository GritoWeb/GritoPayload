/**
 * Conteúdo final da página Agências (PT + EN).
 * Fonte: ../claude/gritoweb/site/agencias.md e agencies-en.md.
 *
 * ⚠️ As seções "Como funciona o white label", "Processo de parceria" e o FAQ afirmam
 * compromissos operacionais (entrega sem marca, confidencialidade, precificação, prazo,
 * política de alteração). Nesta revisão o markdown voltou a marcá-los [CONFIRMAR]: as
 * respostas reais (modelo de preço, faixas de prazo, canal de comunicação) ainda não
 * existem, e o que está gravado é o texto neutro que o próprio conteúdo sugere.
 *
 * O conteúdo também RECUOU numa afirmação: o passo 1 da S3 não diz mais "não com o seu
 * cliente" — o markdown proíbe afirmar isso enquanto a operação não estiver definida.
 *
 * Saem do layout atual: checklistGrid, pullQuote e homeSectionCta (sem contrapartida no
 * conteúdo final). O FAQ vai de 6 para 8 itens.
 */
import type { Block, PageContent } from './types'
import { CHANNELS, LOREM_CTA, LOREM_FEATURES, PLACEHOLDER_IMAGE, STATS } from './_placeholders'

const hero = {
  pt: {
    type: 'defaultHero',
    eyebrow: 'White label · Desenvolvimento para agências',
    heroTitle: 'O *braço técnico* da sua agência,\ncom a sua marca na entrega.',
    titleMaxWidth: 'none',
    heroDescription:
      'Sua agência assina o projeto. Nós desenvolvemos por trás, em white label, com a performance e a segurança que o cliente exige. Mais de 15 anos, no Brasil e nos Estados Unidos. A GritoWeb nunca aparece.',
    cta1Label: 'Falar com a GritoWeb',
    cta1Href: '/contato',
    cta2Label: 'Como funciona o white label',
    // Âncora morta: nenhum bloco emite id= no HTML, e o campo não é localizado (o
    // conteúdo EN pede #how-it-works, impossível de coexistir). Richard ajusta depois.
    cta2Href: '#como-funciona',
  },
  en: {
    type: 'defaultHero',
    eyebrow: 'White label · Development for agencies',
    heroTitle: "Your agency's *technical arm*,\nwith your brand on the delivery.",
    titleMaxWidth: 'none',
    heroDescription:
      'Your agency signs the project. We develop behind the scenes, on a white-label basis, with the performance and security the client demands. More than 15 years, in Brazil and the United States. GritoWeb never appears.',
    cta1Label: 'Talk to GritoWeb',
    cta1Href: '/contato',
    cta2Label: 'How white label works',
    cta2Href: '#como-funciona',
  },
}

// ── Seção 2 — O problema ─────────────────────────────────────────────────────
const problem = {
  pt: {
    blockType: 'homeSectionAbout',
    eyebrow: 'Por que existimos para agências',
    title: 'A parte técnica não pode ser\no *gargalo* da sua agência.',
    titleMaxWidth: 'none',
    description:
      'Uma agência vende estratégia, marca e campanha. Na hora de desenvolver, começa a parte que consome prazo, exige mão especializada e não perdoa erro.\n\nCarregar um desenvolvedor fixo é caro e fica ocioso entre um projeto e outro.\n\nO que a sua agência precisa é um parceiro técnico que entre quando o projeto pede, entregue com a sua marca e responda pelo resultado. É esse o nosso lugar.',
    image: PLACEHOLDER_IMAGE,
    features: LOREM_FEATURES.pt,
    ...LOREM_CTA.pt,
  },
  en: {
    blockType: 'homeSectionAbout',
    eyebrow: 'Why we exist for agencies',
    title: "The technical side *can't be*\nyour agency's bottleneck.",
    titleMaxWidth: 'none',
    description:
      "An agency sells strategy, brand, and campaign. When it's time to develop, the part begins that eats up timelines, demands specialized hands, and doesn't forgive mistakes.\n\nCarrying a full-time developer is expensive and sits idle between one project and the next.\n\nWhat your agency needs is a technical partner that steps in when the project calls for it, delivers under your brand, and answers for the result. That's our place.",
    image: PLACEHOLDER_IMAGE,
    features: LOREM_FEATURES.en,
    ...LOREM_CTA.en,
  },
}

// ── Seção 3 — Como funciona o white label ────────────────────────────────────
const howItWorks = {
  pt: {
    blockType: 'homeSectionProcess',
    background: 'dark',
    eyebrow: 'Como funciona',
    title: 'A GritoWeb é *invisível*.\nO projeto é 100% da sua agência.',
    titleMaxWidth: 'none',
    description:
      'White label, na prática: nós desenvolvemos, a sua agência entrega. Nenhuma marca nossa chega ao cliente final.',
    highlightIndex: 2,
    steps: [
      {
        title: 'Você mantém a relação com o cliente.',
        description:
          'A conta é da sua agência, do briefing à entrega. Falamos com o seu time.',
      },
      {
        title: 'A entrega sai com a sua marca.',
        description: 'Sem logo, sem link, sem crédito da GritoWeb no rodapé.',
      },
      {
        title: 'O seu cliente continua sendo só seu.',
        description: 'Tratamos o projeto e o cliente da sua agência como confidenciais.',
      },
      {
        title: 'Você é o ponto único com o cliente.',
        description:
          'Sua agência apresenta, aprova e entrega. Nós ficamos no bastidor técnico, no ritmo que o seu processo pedir.',
      },
    ],
  },
  en: {
    blockType: 'homeSectionProcess',
    background: 'dark',
    eyebrow: 'How it works',
    title: "GritoWeb is *invisible*.\nThe project is 100% your agency's.",
    titleMaxWidth: 'none',
    description:
      'White label, in practice: we develop, your agency delivers. No brand of ours ever reaches the end client.',
    highlightIndex: 2,
    steps: [
      {
        title: 'You keep the client relationship.',
        description:
          'The account belongs to your agency, from briefing to delivery. We talk to your team.',
      },
      {
        title: 'The delivery goes out under your brand.',
        description: 'No logo, no link, no GritoWeb credit in the footer.',
      },
      {
        title: 'Your client stays only yours.',
        description: "We treat your agency's project and client as confidential.",
      },
      {
        title: 'You are the single point of contact with the client.',
        description:
          'Your agency presents, approves and delivers. We stay in the technical background, at the pace your process requires.',
      },
    ],
  },
}

// ── Seção 4 — Para quem é ────────────────────────────────────────────────────
// iconType é obrigatório e o enum não tem valor para "agências de marketing" nem
// "estúdios boutique". Reusamos os que existem (Richard ajusta depois).
const audience = {
  pt: {
    blockType: 'homeSectionServices',
    eyebrow: 'Para quem é',
    title: 'Feito para agências que crescem\n*sem carregar um time de dev*.',
    titleMaxWidth: 'none',
    description:
      'Você domina estratégia e criação. A engenharia fica com a GritoWeb, projeto a projeto, fora do seu custo fixo.',
    services: [
      {
        name: 'Entregue no prazo da campanha.',
        variant: 'blue',
        iconType: 'landing', // reuso: não há ícone de "agência" no enum
        description:
          'Agências de marketing: você cuida de campanha, mídia e conteúdo; nós desenvolvemos o site, a landing page ou a integração que a campanha exige, no prazo da mídia.',
        ctaLabel: 'Falar com a GritoWeb',
        ctaHref: '/contato',
      },
      {
        name: 'Veja o seu design virar site, fiel ao último pixel.',
        variant: 'orange',
        iconType: 'brand',
        description:
          'Agências de branding e design: você cria a marca e o layout; nós transformamos num site rápido e seguro, sem simplificar a sua criação para "caber no tema".',
        ctaLabel: 'Falar com a GritoWeb',
        ctaHref: '/contato',
      },
      {
        name: 'Feche projetos maiores do que a sua estrutura.',
        variant: 'blue',
        iconType: 'screen', // reuso: não há ícone de "estúdio" no enum
        description:
          'Estúdios boutique e profissionais sem time de dev: a GritoWeb entra como a área técnica que você ainda não tem, projeto a projeto.',
        ctaLabel: 'Falar com a GritoWeb',
        ctaHref: '/contato',
      },
    ],
  },
  en: {
    blockType: 'homeSectionServices',
    eyebrow: "Who it's for",
    title: 'Built for agencies that grow\n*without carrying a dev team*.',
    titleMaxWidth: 'none',
    description:
      "You own strategy and creative. The engineering stays with GritoWeb, project by project, outside your fixed cost.",
    services: [
      {
        name: "Deliver on the campaign's deadline.",
        variant: 'blue',
        iconType: 'landing',
        description:
          "Marketing agencies: you handle campaign, media, and content; we develop the site, the landing page, or the integration the campaign requires, on the media schedule.",
        ctaLabel: 'Talk to GritoWeb',
        ctaHref: '/contato',
      },
      {
        name: 'Watch your design become a site, faithful to the last pixel.',
        variant: 'orange',
        iconType: 'brand',
        description:
          'Branding and design agencies: you create the brand and the layout; we turn it into a fast, secure site, without simplifying your creative to "fit the theme."',
        ctaLabel: 'Talk to GritoWeb',
        ctaHref: '/contato',
      },
      {
        name: 'Close projects bigger than your structure.',
        variant: 'blue',
        iconType: 'screen',
        description:
          "Boutique studios and professionals without a dev team: GritoWeb comes in as the technical area you don't yet have, project by project.",
        ctaLabel: 'Talk to GritoWeb',
        ctaHref: '/contato',
      },
    ],
  },
}

// ── Seção 5 — O que entregamos ───────────────────────────────────────────────
const deliverables = {
  pt: {
    blockType: 'homeSectionServices',
    eyebrow: 'O que entregamos',
    title: 'Do site ao *sistema de missão crítica*.',
    titleMaxWidth: 'none',
    description:
      'Desenvolvemos em mais de uma stack e escolhemos a tecnologia pelo que o projeto da sua agência precisa entregar. O próprio site da GritoWeb roda em PayloadCMS, não na ferramenta que a maioria esperaria.',
    services: [
      {
        name: 'WordPress sob medida',
        variant: 'blue',
        iconType: 'globe',
        description:
          'Tema próprio a partir do design da sua agência, código que envelhece bem e a segurança que um site profissional exige. Sem pilha de plugin: só o necessário, bem feito.',
        ctaLabel: 'Falar com a GritoWeb',
        ctaHref: '/contato',
      },
      {
        name: 'E-commerce',
        variant: 'orange',
        iconType: 'cart',
        description:
          'Lojas que aguentam volume, integram pagamento e estoque, e continuam rápidas no pico de venda.',
        ctaLabel: 'Falar com a GritoWeb',
        ctaHref: '/contato',
      },
      {
        name: 'Landing Pages',
        variant: 'blue',
        iconType: 'landing',
        description:
          'Páginas de campanha construídas para carregar rápido e converter, prontas no prazo da mídia.',
        ctaLabel: 'Falar com a GritoWeb',
        ctaHref: '/contato',
      },
      {
        name: 'Sistemas e plataformas',
        variant: 'orange',
        iconType: 'code',
        description:
          'Sistemas desenvolvidos do zero para grande volume de dados e muitas integrações de API. Quando a ferramenta pronta não dá conta, nós desenvolvemos a que dá.',
        ctaLabel: 'Falar com a GritoWeb',
        ctaHref: '/contato',
      },
      {
        name: 'Integrações de API',
        variant: 'blue',
        iconType: 'code', // reuso: não há ícone de "API" no enum
        description:
          'Conexão entre o site e os sistemas que o cliente da sua agência já usa: CRM, ERP, pagamento, plataformas de dados.',
        ctaLabel: 'Falar com a GritoWeb',
        ctaHref: '/contato',
      },
      {
        name: 'Manutenção e suporte técnico',
        variant: 'orange',
        iconType: 'screen', // reuso: não há ícone de "manutenção" no enum
        description: 'Acompanhamento depois do lançamento: performance, segurança e atualizações.',
        ctaLabel: 'Falar com a GritoWeb',
        ctaHref: '/contato',
      },
    ],
  },
  en: {
    blockType: 'homeSectionServices',
    eyebrow: 'What we deliver',
    title: 'From the website to the *mission-critical system*.',
    titleMaxWidth: 'none',
    description:
      "We develop on more than one stack and choose the technology by what your agency's project needs to deliver. GritoWeb's own site runs on PayloadCMS, not the tool most people would expect.",
    services: [
      {
        name: 'Custom WordPress',
        variant: 'blue',
        iconType: 'globe',
        description:
          "A bespoke theme built from your agency's design, code that ages well, and the security a professional site demands. No stack of plugins: only what's needed, done well.",
        ctaLabel: 'Talk to GritoWeb',
        ctaHref: '/contato',
      },
      {
        name: 'E-commerce',
        variant: 'orange',
        iconType: 'cart',
        description:
          'Stores that handle volume, integrate payment and inventory, and stay fast at the sales peak.',
        ctaLabel: 'Talk to GritoWeb',
        ctaHref: '/contato',
      },
      {
        name: 'Landing Pages',
        variant: 'blue',
        iconType: 'landing',
        description:
          'Campaign pages built to load fast and convert, ready on the media schedule.',
        ctaLabel: 'Talk to GritoWeb',
        ctaHref: '/contato',
      },
      {
        name: 'Systems and platforms',
        variant: 'orange',
        iconType: 'code',
        description:
          "Systems developed from scratch for large data volumes and many API integrations. When the off-the-shelf tool can't cope, we build the one that can.",
        ctaLabel: 'Talk to GritoWeb',
        ctaHref: '/contato',
      },
      {
        name: 'API integrations',
        variant: 'blue',
        iconType: 'code',
        description:
          "Connection between the site and the systems your agency's client already uses: CRM, ERP, payment, and data platforms.",
        ctaLabel: 'Talk to GritoWeb',
        ctaHref: '/contato',
      },
      {
        name: 'Maintenance and technical support',
        variant: 'orange',
        iconType: 'screen',
        description: 'Follow-up after launch: performance, security, and updates.',
        ctaLabel: 'Talk to GritoWeb',
        ctaHref: '/contato',
      },
    ],
  },
}

// ── Seção 6 — Prova ──────────────────────────────────────────────────────────
const proof = {
  pt: {
    blockType: 'homeSectionAbout',
    eyebrow: 'Por que confiar',
    title: 'Já somos o braço técnico\nde *cinco agências*.',
    titleMaxWidth: 'none',
    description:
      'White label depende de uma coisa antes de qualquer contrato: confiança. Hoje a GritoWeb é o braço técnico de cinco agências de marketing, que colocam o próprio nome no que desenvolvemos.\n\nSão mais de 15 anos de desenvolvimento web, com clientes no Brasil e nos Estados Unidos, incluindo projetos para governos americanos.\n\nA sua agência entrega para o cliente. A GritoWeb responde pela parte técnica que sustenta tudo por baixo, quando o projeto entra no ar e cresce.',
    image: PLACEHOLDER_IMAGE,
    features: LOREM_FEATURES.pt,
    ...LOREM_CTA.pt,
  },
  en: {
    blockType: 'homeSectionAbout',
    eyebrow: 'Why trust us',
    title: "We're already the technical arm\nof *five agencies*.",
    titleMaxWidth: 'none',
    description:
      "White label depends on one thing before any contract: trust. Today GritoWeb is the technical arm of five marketing agencies, which put their own name on what we develop.\n\nThat's more than 15 years of web development, with clients in Brazil and the United States, including projects for US governments.\n\nYour agency delivers to the client. GritoWeb answers for the technical part that holds everything up underneath, once the project goes live and grows.",
    image: PLACEHOLDER_IMAGE,
    features: LOREM_FEATURES.en,
    ...LOREM_CTA.en,
  },
}

// ── Seção 7 — Processo de parceria ───────────────────────────────────────────
// background 'white' para não repetir o Process da seção 3, que é 'dark'.
const partnership = {
  pt: {
    blockType: 'homeSectionProcess',
    background: 'white',
    eyebrow: 'Como trabalhamos juntos',
    title: 'Do briefing à entrega, *no seu ritmo*.',
    titleMaxWidth: 'none',
    description: 'Um fluxo claro para a sua agência saber, a cada etapa, o que esperar de nós.',
    highlightIndex: 2,
    steps: [
      {
        title: 'Briefing',
        description:
          'Sua agência traz o projeto, o design e o que o cliente precisa. Alinhamos escopo e o que é técnico antes de qualquer estimativa.',
      },
      {
        title: 'Proposta',
        description: 'Devolvemos escopo, prazo e investimento por escrito.',
      },
      {
        title: 'Execução',
        description:
          'Desenvolvemos com pontos de acompanhamento ao longo do caminho, para a sua agência revisar antes da entrega ao cliente.',
      },
      {
        title: 'Entrega',
        description:
          'Publicamos ou entregamos os arquivos à sua agência, com o suporte combinado para o pós-lançamento.',
      },
    ],
  },
  en: {
    blockType: 'homeSectionProcess',
    background: 'white',
    eyebrow: 'How we work together',
    title: 'From briefing to delivery, *at your pace*.',
    titleMaxWidth: 'none',
    description: 'A clear flow so your agency knows, at every stage, what to expect from us.',
    highlightIndex: 2,
    steps: [
      {
        title: 'Briefing',
        description:
          "Your agency brings the project, the design and what the client needs. We align scope and what's technical before any estimate.",
      },
      {
        title: 'Proposal',
        description: 'We return scope, timeline and investment in writing.',
      },
      {
        title: 'Execution',
        description:
          'We develop with checkpoints along the way, so your agency can review before delivery to the client.',
      },
      {
        title: 'Delivery',
        description:
          'We publish or hand over the files to your agency, with the agreed support for the post-launch.',
      },
    ],
  },
}

// ── Seção 8 — FAQ ────────────────────────────────────────────────────────────
const faq = {
  pt: {
    blockType: 'faqBlock',
    eyebrow: 'Perguntas frequentes',
    title: 'As dúvidas que toda agência tem antes de\n*escolher um parceiro de desenvolvimento*.',
    titleMaxWidth: 'none',
    defaultOpenIndex: 0,
    items: [
      {
        question: 'Quem assina o contrato?',
        answer:
          'A GritoWeb assina contrato apenas com a sua agência. Não há relação contratual entre nós e o cliente final.',
      },
      {
        question: 'O cliente final descobre que vocês existem?',
        answer:
          'Não. Toda a entrega é sem marca da GritoWeb e a comunicação com o cliente passa pela sua agência.',
      },
      {
        question: 'Como funciona a precificação?',
        answer:
          'Trabalhamos com orçamento por projeto, a partir do escopo definido no briefing.',
      },
      {
        question: 'Qual o prazo de entrega?',
        answer: 'O prazo é definido na proposta, de acordo com o escopo de cada projeto.',
      },
      {
        question: 'Como é a comunicação durante o projeto?',
        answer: 'Sua agência tem um canal direto com o nosso time durante todo o projeto.',
      },
      {
        question: 'E se o cliente pedir alteração depois da entrega?',
        answer:
          'Não sumimos depois da entrega. Ajustes e novas demandas são combinados caso a caso com a sua agência.',
      },
      {
        question: 'Vocês atendem agências fora do Brasil?',
        answer: 'Sim. A GritoWeb já atua no Brasil e nos Estados Unidos.',
      },
      {
        question: 'A minha agência mantém o crédito e a propriedade do projeto?',
        answer: 'Sim. O projeto é da sua agência e do cliente dela.',
      },
    ],
  },
  en: {
    blockType: 'faqBlock',
    eyebrow: 'Frequently asked questions',
    title: 'The questions every agency has before\n*choosing a development partner*.',
    titleMaxWidth: 'none',
    defaultOpenIndex: 0,
    items: [
      {
        question: 'Who signs the contract?',
        answer:
          'GritoWeb signs a contract only with your agency. There is no contractual relationship between us and the end client.',
      },
      {
        question: 'Does the end client find out you exist?',
        answer:
          'No. The entire deliverable is unbranded from GritoWeb and all communication with the client goes through your agency.',
      },
      {
        question: 'How does pricing work?',
        answer:
          'We work with a per-project quote, based on the scope defined in the briefing.',
      },
      {
        question: "What's the delivery timeline?",
        answer:
          'The timeline is defined in the proposal, according to the scope of each project.',
      },
      {
        question: 'How does communication work during the project?',
        answer: 'Your agency has a direct channel to our team throughout the project.',
      },
      {
        question: 'What if the client requests a change after delivery?',
        answer:
          "We don't disappear after delivery. Adjustments and new requests are agreed case by case with your agency.",
      },
      {
        question: 'Do you serve agencies outside Brazil?',
        answer: 'Yes. GritoWeb already operates in Brazil and the United States.',
      },
      {
        question: 'Does my agency keep credit and ownership of the project?',
        answer: "Yes. The project belongs to your agency and its client.",
      },
    ],
  },
}

// ── Seção 9 — CTA final ──────────────────────────────────────────────────────
const contact = {
  pt: {
    blockType: 'contactSection',
    eyebrow: 'Vamos conversar',
    heading: 'Um braço técnico pronto para a sua próxima entrega.',
    sidebarEyebrow: 'Fale direto',
    successTitle: 'Mensagem enviada',
    successMessage:
      'Recebemos sua mensagem. Retornamos com o formato de parceria, escopo e investimento.',
    channels: CHANNELS.pt,
  },
  en: {
    blockType: 'contactSection',
    eyebrow: "Let's talk",
    heading: 'A technical arm ready for your next delivery.',
    sidebarEyebrow: 'Reach us directly',
    successTitle: 'Message sent',
    successMessage:
      'We got your message. We come back with the partnership format, scope and investment.',
    channels: CHANNELS.en,
  },
}

const meta = {
  pt: {
    title: 'Desenvolvimento white label para agências | GritoWeb',
    description:
      'A GritoWeb é o braço técnico de desenvolvimento da sua agência, em white label. WordPress e sistemas sob medida, sua marca na entrega. 15+ anos, Brasil e EUA.',
  },
  en: {
    title: 'White-label development for agencies | GritoWeb',
    description:
      "GritoWeb is your agency's technical development arm, white label. WordPress and custom-built systems, your brand on the delivery. 15+ years, Brazil and the US.",
  },
}

export const agencias: PageContent = {
  slug: 'agencias',
  passthroughBlocks: [],
  build: (locale) => ({
    hero: hero[locale],
    meta: meta[locale],
    layout: [
      problem[locale],
      howItWorks[locale],
      audience[locale],
      deliverables[locale],
      proof[locale],
      STATS[locale],
      partnership[locale],
      faq[locale],
      contact[locale],
    ] as Block[],
  }),
}
