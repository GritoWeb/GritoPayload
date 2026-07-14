/**
 * Conteúdo final da página Blog (PT + EN).
 * Fonte: ../claude/gritoweb/site/blog.md e blog-en.md.
 *
 * ⚠️ A Seção 6 (newsletter) NÃO foi gravada: não existe bloco de captura de e-mail no
 * projeto. Fica pendente até alguém construir o bloco.
 *
 * Nota de voz: o "a gente" aqui é DELIBERADO, não descuido. O blog.md declara voz PONTE
 * e autoriza o pronome com parcimônia ("é a antessala do blog"), ao contrário do resto do
 * site, que segue o VOICE_GUIDE ("zero 'a gente'"). Não uniformizar sem falar com o autor.
 *
 * Sai do layout atual: homeSectionContact (não existe no conteúdo final).
 */
import type { Block, PageContent } from './types'
import { LOREM_CTA, LOREM_FEATURES, PLACEHOLDER_IMAGE } from './_placeholders'

const hero = {
  pt: {
    type: 'defaultHero',
    eyebrow: 'Blog da GritoWeb',
    heroTitle: 'Tecnologia explicada\n*sem enrolação*.',
    titleMaxWidth: 'none',
    heroDescription:
      'Aqui a gente abre os bastidores: o que aprendemos em mais de 15 anos de web e o que todo dono de negócio devia saber antes de contratar um site. Sem jargão, sem vender fumaça.',
  },
  en: {
    type: 'defaultHero',
    eyebrow: 'GritoWeb Blog',
    heroTitle: 'Technology explained\n*without the runaround*.',
    titleMaxWidth: 'none',
    heroDescription:
      "This is where we open up the behind-the-scenes: what we've learned in more than 15 years on the web and what every business owner should know before hiring someone to build a site. No jargon, no selling smoke.",
  },
}

// ── Seções 2, 3 e 4 — filtro, destaque e lista ───────────────────────────────
// O conteúdo pede categorias e um post em destaque. As categorias vivem na collection
// `tags`, não no bloco. O featuredPost fica a cargo do editor no admin.
const listing = {
  pt: {
    blockType: 'blogListing',
    eyebrow: 'Arquivo',
    title: 'Todos os *posts*.',
    titleMaxWidth: 'none',
    postsPerPage: 9,
    showSearch: true,
    showFilters: true,
  },
  en: {
    blockType: 'blogListing',
    eyebrow: 'Archive',
    title: 'All *posts*.',
    titleMaxWidth: 'none',
    postsPerPage: 9,
    showSearch: true,
    showFilters: true,
  },
}

// ── Seção 5 — Por que a gente faz isso ───────────────────────────────────────
// Só eyebrow + título + corpo no conteúdo. image/features/cta são LOREM.
const why = {
  pt: {
    blockType: 'homeSectionAbout',
    eyebrow: 'Por que a gente faz isso',
    title: 'Conhecimento que a gente\n*não cobra* pra dividir.',
    titleMaxWidth: 'none',
    description:
      'A GritoWeb desenvolve para empresas e agências há mais de 15 anos, e boa parte do que a gente sabe dá pra passar adiante de graça. É o combinado da casa: quem cresce, devolve.\n\nAqui a gente escreve pra ajudar o dono de negócio a decidir melhor e não cair em conversa fiada, mesmo que o projeto nunca passe pela gente. Do jeito que a gente explicaria pra um amigo no café.',
    image: PLACEHOLDER_IMAGE,
    features: LOREM_FEATURES.pt,
    ...LOREM_CTA.pt,
  },
  en: {
    blockType: 'homeSectionAbout',
    eyebrow: 'Why we do this',
    title: "Knowledge we *don't charge*\nto share.",
    titleMaxWidth: 'none',
    description:
      "GritoWeb has been building for companies and agencies for more than 15 years, and a good chunk of what we know can be passed along for free. It's the house rule: those who grow, give back.\n\nHere we write to help the business owner decide better and not fall for empty talk, even if the project never comes to us. The way we'd explain it to a friend over coffee.",
    image: PLACEHOLDER_IMAGE,
    features: LOREM_FEATURES.en,
    ...LOREM_CTA.en,
  },
}

// ── Seção 7 — CTA final ──────────────────────────────────────────────────────
const cta = {
  pt: {
    blockType: 'homeSectionCta',
    variant: 'blue',
    eyebrow: 'Próximo passo',
    title: 'Leu, curtiu e quer\n*tirar a ideia do papel*?',
    titleMaxWidth: 'none',
    description:
      'Se você tem um projeto de site ou sistema em mente, a gente adora conversar sobre isso.',
    cta1Label: 'Falar com a GritoWeb',
    cta1Href: '/contato',
    cta1Variant: 'primary',
  },
  en: {
    blockType: 'homeSectionCta',
    variant: 'blue',
    eyebrow: 'Next step',
    title: 'Read it, liked it, and want to\n*get the idea off the ground*?',
    titleMaxWidth: 'none',
    description: "If you have a site or system project in mind, we'd love to talk about it.",
    cta1Label: 'Talk to GritoWeb',
    cta1Href: '/contato',
    cta1Variant: 'primary',
  },
}

const meta = {
  pt: {
    title: 'Blog da GritoWeb — Tecnologia web explicada sem jargão',
    description:
      'Bastidores de projeto, WordPress e o digital descomplicado para dono de negócio. Conteúdo de quem desenvolve para web há mais de 15 anos, no Brasil e nos EUA.',
  },
  en: {
    title: 'GritoWeb Blog — Web technology explained without the jargon',
    description:
      "Project behind-the-scenes, WordPress, and digital made simple for business owners. Content from a team that's been building for the web for more than 15 years, in Brazil and the US.",
  },
}

export const blog: PageContent = {
  slug: 'blog',
  passthroughBlocks: [],
  build: (locale) => ({
    hero: hero[locale],
    meta: meta[locale],
    layout: [listing[locale], why[locale], cta[locale]] as Block[],
  }),
}
