import React from 'react'
import { Avatar } from './Avatar'

// Contained quote card: the highlight sentence carries the large type, the
// quote itself always stays at reading size below it. The two roles are fixed
// — an empty highlight never promotes the quote to the large treatment.
export function BigQuote({
  highlight,
  body,
  author,
  role,
}: {
  highlight?: string | null
  body?: string | null
  author?: string | null
  role?: string | null
}) {
  if (!highlight && !body) return null

  return (
    <figure className="relative m-0 rounded-[22px] border border-blue/15 bg-blue/[0.06] p-7 pl-[80px] md:p-11 md:pl-[104px]">
      {/* Decorative opening quote — the real Lato glyph, hanging in the left
          gutter. Line-height 1 puts the mark at the top of the line box, so a
          fixed height crops the empty space the large font-size leaves below.
          The figure's extra left padding is what carves out the gutter, so the
          quote, the body and the caption all share one left edge. */}
      <span
        aria-hidden="true"
        className="absolute left-7 top-7 h-[42px] select-none overflow-hidden font-display text-[88px] font-black leading-none text-orange md:left-11 md:top-11"
      >
        &ldquo;
      </span>
      <blockquote className="m-0">
        {highlight && (
          <p className="m-0 text-[clamp(1.5rem,3.4vw,2.15rem)] font-extrabold leading-[1.24] tracking-[-0.01em] text-blue text-balance">
            {highlight}
          </p>
        )}
        {body && (
          <p className={`m-0 text-base leading-relaxed text-ink-soft ${highlight ? 'mt-[18px]' : ''}`}>
            {body}
          </p>
        )}
      </blockquote>
      {(author || role) && (
        <figcaption className="mt-6 flex items-center gap-3">
          {author && <Avatar name={author} variant="orange" size="md" />}
          <div>
            {author && <div className="font-display text-[0.95rem] font-extrabold text-ink">{author}</div>}
            {role && <div className="text-[0.82rem] text-mute">{role}</div>}
          </div>
        </figcaption>
      )}
    </figure>
  )
}
