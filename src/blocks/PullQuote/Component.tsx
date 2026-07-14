import React from 'react'
import type { PullQuoteBlock } from '@/payload-types'
import { Sparkle } from '@/home/illustrations'

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

/** Tipografia da citação — os parágrafos do corpo usam exatamente a mesma. */
const quoteType = 'font-display font-light text-[28px] leading-tight text-ink tracking-tight'

/**
 * Acima disso a citação não cabe em uma linha no container (max-w-6xl = 1152px, a ~14px
 * por caractere nesta fonte). Forçar `whitespace-nowrap` numa frase mais longa que isto
 * estoura o viewport e gera rolagem horizontal — foi o que aconteceu em /servicos.
 */
const ONE_LINE_MAX_CHARS = 80

export const PullQuoteComponent: React.FC<PullQuoteBlock> = ({
  eyebrow,
  quote,
  body,
  author,
  role,
}) => {
  const paragraphs = (body ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  // Citação curta: uma linha só no desktop. Citação longa: quebra normalmente, na
  // largura de leitura, sem nunca ultrapassar o container.
  const fitsOneLine = (quote ?? '').length <= ONE_LINE_MAX_CHARS

  return (
    <section aria-label="Depoimento em destaque" className="bg-white border-y border-line px-5 section-y">
      {/* Largo o bastante para a citação curta caber em uma linha no desktop; o resto do
          conteúdo continua centralizado na largura de leitura (max-w-3xl). */}
      <div className="max-w-6xl mx-auto text-center relative">
        <Sparkle size={32} color="#1A5EAB" className="absolute top-0 left-0 opacity-25" />
        <Sparkle size={24} color="#FE9D2B" className="absolute bottom-0 right-0 opacity-25" />
        {eyebrow && <p className="font-eyebrow m-0 mb-7">{eyebrow}</p>}
        {/* text-balance evita a palavra órfã sempre que a frase quebra em mais de uma linha. */}
        <p
          className={`m-0 mx-auto max-w-3xl text-balance ${
            fitsOneLine ? 'xl:max-w-none xl:whitespace-nowrap' : ''
          } ${quoteType}`}
        >
          {quote}
        </p>
        {paragraphs.map((paragraph, i) => (
          <p key={i} className={`mb-0 mt-3 max-w-3xl mx-auto text-balance ${quoteType}`}>
            {paragraph}
          </p>
        ))}
        {(author || role) && (
          <div className="mt-8 flex items-center justify-center gap-3.5">
            {author && (
              <span
                aria-label={author}
                className="inline-flex h-12 w-12 rounded-full bg-paper-dim items-center justify-center font-display font-bold text-mute"
              >
                {initials(author)}
              </span>
            )}
            <div className="text-left">
              {author && (
                <div className="font-display font-bold text-[15px] text-ink">{author}</div>
              )}
              {role && <div className="text-[13px] text-mute">{role}</div>}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
