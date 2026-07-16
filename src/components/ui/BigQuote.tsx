import React from 'react'
import { Avatar } from './Avatar'

export function BigQuote({
  quote,
  author,
  role,
}: {
  quote: string
  author?: string | null
  role?: string | null
}) {
  return (
    <figure className="relative bg-blue text-white rounded-[32px] p-10 md:p-14 overflow-hidden container">
      <span aria-hidden="true" className="block font-serif text-orange text-[120px] leading-[0.6]">
        &ldquo;
      </span>
      <blockquote className="m-0">
        <p className="m-0 font-display font-light text-[24px] md:text-[36px] leading-tight max-w-4xl">
          {quote}
        </p>
      </blockquote>
      {(author || role) && (
        <figcaption className="mt-7 flex items-center gap-3.5">
          {author && <Avatar name={author} variant="orange" size="md" />}
          <div>
            {author && <div className="font-display font-bold">{author}</div>}
            {role && <div className="text-sm text-white/75">{role}</div>}
          </div>
        </figcaption>
      )}
      <div aria-hidden="true" className="absolute -bottom-8 -right-8 opacity-10 hidden md:block select-none pointer-events-none">
        <span className="font-serif text-white text-[220px] leading-none">&rdquo;</span>
      </div>
    </figure>
  )
}
