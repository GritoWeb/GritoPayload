import React from 'react'
import type { Page } from '@/payload-types'
import type { Media } from '@/payload-types'
import { HeroSection } from '@/components/sections'
import { Button } from '@/home/primitives'
import { parseTitle } from '@/utilities/parseTitle'
import { titleMaxWidthClass, type TitleMaxWidth } from '@/utilities/titleMaxWidthClass'
import { Sparkle } from '@/home/illustrations'
import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { FadeInImage } from '@/components/ui/FadeInImage'

export const DefaultHero: React.FC<Page['hero']> = ({
  eyebrow,
  heroTitle,
  titleMaxWidth,
  heroDescription,
  cta1Label,
  cta1Href,
  cta2Label,
  cta2Href,
  heroImage,
}) => {
  const media = heroImage as Media | null
  const hasActions = cta1Label || cta2Label

  return (
    <div>
      <HeroSection
        eyebrow={eyebrow ?? undefined}
        title={heroTitle ? parseTitle(heroTitle) : ''}
        titleClassName={titleMaxWidthClass(titleMaxWidth as TitleMaxWidth | null | undefined)}
        description={heroDescription ?? undefined}
        actions={
          hasActions ? (
            <>
              {cta1Label && (
                <Button href={cta1Href ?? '#'} icon={<ArrowIcon size={24} />}>
                  {cta1Label}
                </Button>
              )}
              {cta2Label && (
                <Button href={cta2Href ?? '#'} variant="ghost">
                  {cta2Label}
                </Button>
              )}
            </>
          ) : undefined
        }
        media={
          media && typeof media !== 'string' ? (
            // The width constraint belongs on the wrapper, not the image. With it
            // on the image, `w-full` resolved against a shrink-to-fit parent that
            // had nothing to size itself from until the file arrived, so the box
            // stayed collapsed and everything below jumped once it loaded.
            <div className="relative w-full max-w-[480px]">
              <Sparkle size={38} color="#282828" className="absolute top-5 right-12 animate-fade-in" />
              <Sparkle size={24} color="#FE9D2B" className="absolute bottom-14 left-2.5 animate-fade-in" />
              <FadeInImage
                src={media.url!}
                alt={media.alt || ''}
                width={media.width ?? 480}
                height={media.height ?? 480}
                priority
                className="w-full max-w-[480px] h-auto"
              />
            </div>
          ) : undefined
        }
      />
    </div>
  )
}