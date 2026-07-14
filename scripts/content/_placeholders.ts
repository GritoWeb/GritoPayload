/**
 * PLACEHOLDERS — conteúdo que NÃO existe no material final e precisa ser substituído.
 *
 * Cinco seções do conteúdo (2 em servicos, 2 em agencias, 1 em blog) são apenas
 * eyebrow + título + corpo. O bloco SectionAbout, porém, exige `image`, `features[]`
 * (mín. 1), `ctaLabel` e `ctaHref`. Nada disso foi escrito.
 *
 * Preenchemos com lorem ipsum DE PROPÓSITO: é inconfundivelmente placeholder. Copy
 * plausível inventada seria pior — passaria por conteúdo real e ninguém iria trocá-la.
 *
 * Para achar tudo o que falta:  grep -rn "LOREM" scripts/content/
 *
 * ⚠️ NÃO DEVE IR PARA PRODUÇÃO.
 */

/** Única imagem "sobre" na Media (id 4 — sobrenos-hero-attached.svg). */
export const PLACEHOLDER_IMAGE = 4

export const LOREM_FEATURES = {
  pt: [
    {
      title: 'Lorem ipsum',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
  ],
  en: [
    {
      title: 'Lorem ipsum',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
  ],
}

export const LOREM_CTA = {
  pt: { ctaLabel: 'Lorem ipsum', ctaHref: '#' },
  en: { ctaLabel: 'Lorem ipsum', ctaHref: '#' },
}

/** Canais de contato: valores reais já publicados no CMS (o markdown os deixa como [CONFIRMAR]). */
export const CHANNELS = {
  pt: [
    {
      icon: 'whatsapp',
      label: 'WhatsApp',
      value: '(15) 99739-4486',
      hint: 'Prefere falar agora? Chame no WhatsApp.',
      href: 'https://wa.me/5515997394486',
    },
    {
      icon: 'email',
      label: 'E-mail',
      value: 'contato@gritoweb.com',
      href: 'mailto:contato@gritoweb.com',
    },
    { icon: 'phone', label: 'Telefone', value: '(15) 99739-4486', href: 'tel:+5515997394486' },
  ],
  en: [
    {
      icon: 'whatsapp',
      label: 'WhatsApp',
      value: '(15) 99739-4486',
      hint: 'Prefer to talk now? Reach us on WhatsApp.',
      href: 'https://wa.me/5515997394486',
    },
    {
      icon: 'email',
      label: 'Email',
      value: 'contato@gritoweb.com',
      href: 'mailto:contato@gritoweb.com',
    },
    { icon: 'phone', label: 'Phone', value: '(15) 99739-4486', href: 'tel:+5515997394486' },
  ],
}

/**
 * Faixa de números — a mesma na home, em servicos e em agencias.
 *
 * `value` NÃO é localizado: um único valor serve aos dois idiomas. Por isso o terceiro
 * usa "BR · US" (neutro) e o país vai para o `label`, que é localizado. Pelo mesmo motivo
 * a nota do Google fica "5,0" (vírgula, padrão pt-BR) também na versão em inglês.
 */
export const STATS = {
  pt: {
    blockType: 'homeSectionStats',
    showDecoration: true,
    stats: [
      { value: '15+', label: 'anos de estrada' },
      { value: '+120', label: 'projetos entregues' },
      { value: 'BR · US', label: 'clientes no Brasil e nos Estados Unidos' },
      { value: '5,0', label: 'no Google' },
    ],
  },
  en: {
    blockType: 'homeSectionStats',
    showDecoration: true,
    stats: [
      { value: '15+', label: 'years in the field' },
      { value: '+120', label: 'projects delivered' },
      { value: 'BR · US', label: 'clients in Brazil and the US' },
      { value: '5,0', label: 'on Google' },
    ],
  },
}
