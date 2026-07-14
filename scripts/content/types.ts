export type Locale = 'pt' | 'en'

export type Block = Record<string, unknown>

/**
 * Contrato que cada arquivo de conteúdo de página precisa exportar.
 *
 * `build` recebe os blocos preservados (os que estão na página hoje, não fazem parte do
 * conteúdo final, e devem sobreviver ao seed) já resolvidos para o locale pedido, e
 * devolve o documento pronto para o payload.update.
 *
 * A ORDEM e a QUANTIDADE de blocos — e de linhas dentro de cada array — precisam ser
 * idênticas entre `pt` e `en`: o runner casa as duas árvores pela posição para
 * reaproveitar os IDs que o Payload gera na gravação do PT.
 */
export type PageContent = {
  slug: string
  /** blockTypes que ficam na página como estão hoje, fora do conteúdo final. */
  passthroughBlocks: readonly string[]
  build: (
    locale: Locale,
    passthrough: Record<string, Block | undefined>,
  ) => {
    hero: Block
    meta: Block
    layout: Block[]
  }
}
