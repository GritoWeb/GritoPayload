import React from 'react'
import { FadeInImage } from '@/components/ui/FadeInImage'
import type { SectionAboutBlock } from '@/payload-types'
import type { Media } from '@/payload-types'
import { AboutSplit, AboutFeatures } from '@/components/sections'
import { Button } from '@/components/Button'
import { parseTitle } from '@/utilities/parseTitle'
import { titleMaxWidthClass, type TitleMaxWidth } from '@/utilities/titleMaxWidthClass'
import { ArrowIcon } from '@/components/ui/ArrowIcon'

export const SectionAboutComponent: React.FC<SectionAboutBlock> = ({
  eyebrow,
  title,
  titleMaxWidth,
  description,
  ctaLabel,
  ctaHref,
  features,
  image,
}) => {
  const media = image as Media

  // O corpo vem do CMS como textarea: a linha em branco separa parágrafos. Sem isto o
  // \n\n é colapsado pelo HTML e dois ou três parágrafos viram um bloco corrido.
  const paragraphs = (description ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className="animate-fade-in">
      <AboutSplit
        media={
          media && typeof media !== 'string' ? (
            <FadeInImage
              src={media.url!}
              alt={media.alt || ''}
              width={media.width ?? 520}
              height={media.height ?? 520}
              className="w-full max-w-[520px] h-auto"
            />
          ) : null
        }
      >
        <p className="font-eyebrow m-0 mb-2">{eyebrow}</p>
        <h2
          className={['m-0 text-blue', titleMaxWidthClass(titleMaxWidth as TitleMaxWidth | null | undefined)]
            .filter(Boolean)
            .join(' ')}
        >
          {parseTitle(title)}
        </h2>
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="body-text mt-4 text-ink-soft">
            {paragraph}
          </p>
        ))}
        <AboutFeatures
          items={(features ?? []).map((f) => ({ title: f.title, description: f.description }))}
          className="mt-7"
        />
        <div className="mt-8">
          <Button variant="blue" href={ctaHref} icon={<ArrowIcon size={24} />}>
            {ctaLabel}
          </Button>
        </div>
      </AboutSplit>
    </div>
  )
}