import React from 'react'
import type { ChecklistGridBlock } from '@/payload-types'
import { SectionTitle } from '@/components/sections'
import { parseTitle } from '@/utilities/parseTitle'
import { titleMaxWidthClass, type TitleMaxWidth } from '@/utilities/titleMaxWidthClass'

const CheckIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#FE9D2B"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

export const ChecklistGridComponent: React.FC<ChecklistGridBlock> = ({
  eyebrow,
  title,
  titleMaxWidth,
  items,
}) => {
  return (
    <section className="px-5 section-y">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <SectionTitle
            eyebrow={eyebrow ?? undefined}
            align="center"
            titleClassName={titleMaxWidthClass(titleMaxWidth as TitleMaxWidth | null | undefined)}
          >
            {parseTitle(title)}
          </SectionTitle>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-w-5xl mx-auto list-none p-0 m-0">
          {(items ?? []).map((item) => (
            <li key={item.id} className="flex gap-4 items-start py-6 border-b border-line">
              <span className="shrink-0 inline-flex h-9 w-9 rounded-xl bg-orange/15 items-center justify-center">
                <CheckIcon />
              </span>
              <div>
                <h3 className="m-0 font-display font-bold text-lg text-ink">{item.title}</h3>
                {item.description && (
                  <p className="m-0 mt-1.5 text-mute text-[15px]">{item.description}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
