/**
 * Conteúdo final da página Contato (PT + EN).
 * Fonte: ../claude/gritoweb/site/contato.md e contact-en.md.
 *
 * ⚠️ O formulário especificado no conteúdo (Você é / Empresa / Tipo de projeto / Faixa de
 * investimento) NÃO existe: ContactSection/Component.tsx tem nome, e-mail e mensagem,
 * hardcoded. Implementar exige config + componente + action + migration — tarefa separada.
 *
 * ⚠️ Sem campo para: a linha de apoio da Seção 2 ("Quanto mais claro o contexto…"), o
 * título da sidebar ("Prefere falar direto?") e a linha de reforço da Seção 4 (prazo de
 * resposta e horário). O bloco só tem eyebrow + heading.
 *
 * Os dados de contato seguem [CONFIRMAR] no markdown; usamos os valores reais já
 * publicados no CMS, como o Richard autorizou.
 */
import type { Block, PageContent } from './types'
import { CHANNELS } from './_placeholders'

const hero = {
  pt: {
    type: 'defaultHero',
    eyebrow: 'Contato',
    heroTitle: 'Todo bom projeto começa\ncom uma *conversa*.',
    titleMaxWidth: 'none',
    heroDescription:
      'Conte o que você precisa. Retornamos com escopo, prazo e investimento. Empresas e agências falam com a GritoWeb pelo mesmo canal.',
  },
  en: {
    type: 'defaultHero',
    eyebrow: 'Contact',
    heroTitle: 'Every good project starts\nwith a *conversation*.',
    titleMaxWidth: 'none',
    heroDescription:
      'Tell us what you need. We come back with scope, timeline, and investment. Businesses and agencies reach GritoWeb through the same channel.',
  },
}

/**
 * Canais desta página. Não usamos o CHANNELS compartilhado direto porque o conteúdo do
 * contato pede um hint de WhatsApp diferente do das outras páginas e acrescenta o canal
 * de localização. Mudar isso no compartilhado vazaria para home, servicos e agencias.
 */
const channels = {
  pt: [
    ...CHANNELS.pt.map((c) =>
      c.icon === 'whatsapp'
        ? { ...c, hint: 'Para uma primeira conversa rápida, chame no WhatsApp.' }
        : c,
    ),
    { icon: 'location', label: 'Onde estamos', value: 'Sorocaba/SP' },
  ],
  en: [
    ...CHANNELS.en.map((c) =>
      c.icon === 'whatsapp'
        ? { ...c, hint: 'For a quick first conversation, reach us on WhatsApp.' }
        : c,
    ),
    { icon: 'location', label: 'Where we are', value: 'Sorocaba/SP' },
  ],
}

const contact = {
  pt: {
    blockType: 'contactSection',
    eyebrow: 'Fale com a GritoWeb',
    heading: 'Conte sobre o seu projeto.',
    sidebarEyebrow: 'Outros canais',
    successTitle: 'Mensagem enviada',
    successMessage: 'Recebemos sua mensagem. Retornamos com escopo, prazo e investimento.',
    channels: channels.pt,
  },
  en: {
    blockType: 'contactSection',
    eyebrow: 'Talk to GritoWeb',
    heading: 'Tell us about your project.',
    sidebarEyebrow: 'Other channels',
    successTitle: 'Message sent',
    successMessage: 'We got your message. We come back with scope, timeline, and investment.',
    channels: channels.en,
  },
}

const meta = {
  pt: {
    title: 'Contato | GritoWeb — Desenvolvimento web e sistemas sob medida',
    description:
      'Fale com a GritoWeb sobre o seu projeto de site, e-commerce ou sistema sob medida. Atendimento para empresas e agências (white label), no Brasil e nos Estados Unidos.',
  },
  en: {
    title: 'Contact | GritoWeb — Web development and custom systems',
    description:
      'Talk to GritoWeb about your website, e-commerce, or custom system project. Service for businesses and agencies (white label), in Brazil and the United States.',
  },
}

export const contato: PageContent = {
  slug: 'contato',
  passthroughBlocks: [],
  build: (locale) => ({
    hero: hero[locale],
    meta: meta[locale],
    layout: [contact[locale]] as Block[],
  }),
}
