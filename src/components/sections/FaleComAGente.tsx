import React from 'react'

const channelClasses =
  'inline-flex items-center gap-3 px-6 py-3.5 rounded-full border-[1.5px] border-blue text-blue no-underline font-display font-bold transition-colors duration-150 motion-reduce:transition-none hover:bg-blue hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper'

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21a17 17 0 0 1-17-17v-1a2 2 0 0 1 2-2h3a2 2 0 0 1 2 1.7l.6 3.6a2 2 0 0 1-.6 1.8l-1.8 1.8a14 14 0 0 0 6.9 6.9l1.8-1.8a2 2 0 0 1 1.8-.6l3.6.6a2 2 0 0 1 1.7 2v3a2 2 0 0 1-2 2z" />
    </svg>
  )
}

export function FaleComAGente({
  email = 'contato@exemplo.com',
  emailHref = 'mailto:contato@exemplo.com',
  phone = '(11) 99999-9999',
  phoneHref = 'tel:+5511999999999',
  chatMark,
  className = '',
}: {
  email?: string
  emailHref?: string
  phone?: string
  phoneHref?: string
  chatMark: React.ReactNode
  className?: string
}) {
  const root = ['relative px-5 section-y bg-paper border-t border-line', className].filter(Boolean).join(' ')

  return (
    <section aria-label="Contato" className={root}>
      <div className="container flex flex-col md:flex-row justify-between gap-12">
        <div className="flex flex-col text-center lg:text-start lg:flex-row items-center lg:gap-6">
          {chatMark}
          <p className="m-0 font-display leading-none">
            <span className="block font-light text-[42px] text-blue">Fale com</span>
            <span className="block font-black text-[58px] text-orange">a gente!</span>
          </p>
        </div>
        <address className="not-italic flex flex-col gap-3.5">
          <a href={emailHref} className={channelClasses}>
            <MailIcon />
            {email}
          </a>
          <a href={phoneHref} className={channelClasses}>
            <PhoneIcon />
            {phone}
          </a>
        </address>
      </div>
    </section>
  )
}
