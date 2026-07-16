import React from 'react'
import type { SectionProcessBlock } from '@/payload-types'
import { SectionTitle, ProcessTrail } from '@/components/sections'
import { parseTitle } from '@/utilities/parseTitle'
import { titleMaxWidthClass, type TitleMaxWidth } from '@/utilities/titleMaxWidthClass'
import { Sparkle } from '@/home/illustrations'

export const SectionProcessComponent: React.FC<SectionProcessBlock> = ({
  background,
  eyebrow,
  title,
  titleMaxWidth,
  description,
  highlightIndex,
  steps,
}) => {
  const isWhite = background === 'white'

  return (
    <section
      className={`relative px-5 lg:px-12 section-y overflow-hidden${isWhite ? ' bg-white' : ''}`}
    >
      {!isWhite && <Sparkle size={42} color="#FE9D2B" className="absolute top-14 right-20" />}
      <div className="container">
        <div className={`mb-6 ${isWhite ? 'max-w-2xl' : 'text-center max-w-2xl mx-auto'}`}>
          <SectionTitle
            eyebrow={eyebrow}
            align={isWhite ? 'left' : 'center'}
            description={description ?? undefined}
            titleClassName={titleMaxWidthClass(titleMaxWidth as TitleMaxWidth | null | undefined)}
          >
            {parseTitle(title)}
          </SectionTitle>
        </div>
        <ProcessTrail
          steps={(steps ?? []).map((s) => ({
            title: s.title,
            description: s.description ?? undefined,
          }))}
          highlightIndex={highlightIndex ?? -1}
        />
      </div>
    </section>
  )
}
