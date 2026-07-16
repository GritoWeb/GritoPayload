import React from 'react'
import type { SectionProjectsBlock } from '@/payload-types'
import { SectionTitle, ProjectGrid } from '@/components/sections'
import { Button } from '@/components/Button'
import { parseTitle } from '@/utilities/parseTitle'
import { titleMaxWidthClass, type TitleMaxWidth } from '@/utilities/titleMaxWidthClass'
import { ProjectCard } from '@/home/cards'
import { TagMark, ArrowCurve } from '@/home/illustrations'
import { ArrowIcon } from '@/components/ui/ArrowIcon'

function DashboardMotif() {
  return (
    <div
      className="w-[220px] h-[150px] bg-blue rounded-2xl p-3.5 flex flex-col gap-2"
      aria-hidden="true"
    >
      <div className="flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-orange" />
        <div className="w-2 h-2 rounded-full bg-white/30" />
        <div className="w-2 h-2 rounded-full bg-white/30" />
      </div>
      <div className="flex-1 bg-white/15 rounded-md" />
      <div className="flex gap-1.5">
        <div className="flex-1 bg-white/15 rounded-md h-5" />
        <div className="flex-1 bg-orange rounded-md h-5" />
      </div>
    </div>
  )
}

type MotifType = 'tagMark' | 'dashboard' | 'arrowCurve'

function Motif({ type }: { type: MotifType }) {
  switch (type) {
    case 'tagMark':
      return <TagMark size={170} />
    case 'dashboard':
      return <DashboardMotif />
    case 'arrowCurve':
      return <ArrowCurve size={170} color="#FE9D2B" />
  }
}

export const SectionProjectsComponent: React.FC<SectionProjectsBlock> = ({
  eyebrow,
  title,
  titleMaxWidth,
  portfolioLabel,
  portfolioHref,
  projects,
}) => {
  return (
    <section className="bg-white border-y border-line px-5 section-y">
      <div className="container">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-9">
          <SectionTitle
            eyebrow={eyebrow}
            align="left"
            titleClassName={titleMaxWidthClass(titleMaxWidth as TitleMaxWidth | null | undefined)}
          >
            {parseTitle(title)}
          </SectionTitle>
          {portfolioLabel && (
            <Button variant="ghost" href={portfolioHref ?? '#'} icon={<ArrowIcon size={24} />}>
              {portfolioLabel}
            </Button>
          )}
        </div>
        <ProjectGrid>
          {(projects ?? []).map((project) => (
            <ProjectCard
              key={project.id}
              tag={project.tag}
              tagVariant={project.tagVariant as 'blue' | 'orange'}
              accent={project.accent as 'blue' | 'orange'}
              client={project.client}
              year={project.year}
              title={project.title}
              result={project.result ?? undefined}
              motif={<Motif type={project.motifType as MotifType} />}
              href={project.href ?? '#'}
            />
          ))}
        </ProjectGrid>
      </div>
    </section>
  )
}
