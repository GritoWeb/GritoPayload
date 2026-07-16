'use client'

import React, { useState, useId, Children, cloneElement, isValidElement } from 'react'
import type { ContactSectionBlock } from '@/payload-types'
import { ArrowIcon } from '@/components/ui/ArrowIcon'
import { Button } from '@/components/Button'
import { parseTitle } from '@/utilities/parseTitle'
import { submitContact } from './actions'

// ── Icons ────────────────────────────────────────────────────────────────────

const icons: Record<string, React.ReactNode> = {
  email: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  ),
  phone: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.39 19a19.5 19.5 0 0 1-5-5A19.79 19.79 0 0 1 3.09 4.18 2 2 0 0 1 5.08 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 5 5l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  whatsapp: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  ),
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  linkedin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  location: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
}

// ── Primitives ────────────────────────────────────────────────────────────────

const inputBaseClasses = [
  'block w-full bg-transparent',
  'border-0 border-b-2 border-ink-soft',
  'pt-2 pb-2 px-0',
  'font-body text-base text-ink',
  'transition-colors duration-150 motion-reduce:transition-none',
  'placeholder:text-mute',
  'focus:outline-none focus:border-orange focus:[box-shadow:0_1px_0_0_var(--color-orange)]',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'aria-[invalid=true]:border-orange',
].join(' ')

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={[inputBaseClasses, className].filter(Boolean).join(' ')} {...props} />
}

function Textarea({ className = '', rows = 4, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={[inputBaseClasses, 'resize-y', className].filter(Boolean).join(' ')} {...props} />
}

function FormField({
  label,
  hint,
  error,
  children,
  className = '',
}: {
  label?: string
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  const generatedId = useId()
  const child = Children.count(children) === 1 && isValidElement(children) ? children : null
  const inputId = (child?.props as { id?: string })?.id ?? generatedId
  const errorId = error ? `${inputId}-error` : undefined
  const hintId = hint ? `${inputId}-hint` : undefined
  const describedBy =
    [(child?.props as Record<string, string>)?.['aria-describedby'], hintId, errorId]
      .filter(Boolean)
      .join(' ') || undefined

  const enhancedChild = child
    ? cloneElement(child as React.ReactElement<Record<string, unknown>>, {
      id: inputId,
      'aria-invalid': error ? true : (child.props as Record<string, unknown>)['aria-invalid'],
      'aria-describedby': describedBy,
    })
    : children

  return (
    <div className={['group flex flex-col', className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={inputId} className="font-body font-bold text-xs uppercase tracking-[0.14em] text-ink mb-2 transition-colors duration-150 group-focus-within:text-orange">
          {label}
        </label>
      )}
      {enhancedChild}
      {hint && !error && (
        <p id={hintId} className="mt-2 text-xs text-mute">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-2 text-xs text-orange" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}


function IconBadge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={[
        'inline-flex items-center justify-center shrink-0',
        'h-10 w-10 rounded-xl',
        'bg-orange/15 text-orange',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}

// ── ChannelRow ────────────────────────────────────────────────────────────────

const valueLinkClasses =
  'block font-display font-medium text-base text-ink no-underline leading-snug rounded-sm transition-colors duration-150 motion-reduce:transition-none hover:text-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper'

function ChannelRow({
  iconKey,
  label,
  value,
  hint,
  href,
}: {
  iconKey: string
  label: string
  value: string
  hint?: string | null
  href?: string | null
}) {
  return (
    <div className="flex items-start gap-3.5">
      <IconBadge>{icons[iconKey] ?? icons.email}</IconBadge>
      <div className="min-w-0">
        <p className="m-0 mb-1 font-display font-bold text-[11px] uppercase tracking-[0.14em] text-ink">
          {label}
        </p>
        {href ? (
          <a href={href} className={valueLinkClasses}>
            {value}
          </a>
        ) : (
          <p className="m-0 font-display font-medium text-base text-ink leading-snug">{value}</p>
        )}
        {hint && <p className="m-0 mt-1 font-body text-[13px] text-mute">{hint}</p>}
      </div>
    </div>
  )
}

// ── SVG helpers ───────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

// ── Main component ────────────────────────────────────────────────────────────

const emptyForm = { name: '', email: '', message: '' }

export const ContactSectionComponent: React.FC<ContactSectionBlock> = ({
  eyebrow,
  heading,
  sidebarEyebrow = 'Fale direto',
  successTitle = 'Mensagem enviada',
  successMessage = 'Recebemos sua mensagem. Em até 3 dias úteis um de nós entra em contato.',
  channels = [],
}) => {
  const [form, setForm] = useState(emptyForm)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    try {
      await submitContact(form)
    } finally {
      setLoading(false)
      setSent(true)
    }
  }

  const handleReset = () => {
    setSent(false)
    setForm(emptyForm)
  }

  return (
    <section className="px-5 section-y">
      {(eyebrow || heading) && (
        <div className="max-w-5xl mx-auto mb-14">
          {eyebrow && <p className="font-eyebrow m-0 mb-3">{eyebrow}</p>}
          {heading && <h2 className="m-0 text-blue">{parseTitle(heading)}</h2>}
        </div>
      )}

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-20 items-start">
        {/* Form column */}
        <div>
          {sent ? (
            <div className="py-10">
              <div
                aria-hidden="true"
                className="inline-flex h-14 w-14 rounded-full bg-success/15 text-success items-center justify-center mb-5"
              >
                <CheckIcon />
              </div>
              <h3 className="m-0 text-blue text-[26px] font-bold">{successTitle}</h3>
              <p className="mt-2.5 text-ink-soft max-w-sm">{successMessage}</p>
              <Button variant="ghost" className="mt-6" onClick={handleReset}>
                Enviar outra
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>
              <FormField label="Nome">
                <Input
                  name="name"
                  placeholder="Seu nome"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </FormField>

              <FormField label="E-mail">
                <Input
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </FormField>

              <FormField label="Mensagem">
                <Textarea
                  name="message"
                  rows={4}
                  placeholder="Conta um pouco do projeto, do prazo, do que precisa…"
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </FormField>

              <div className="mt-2 flex flex-wrap items-center justify-end gap-3.5">
                <Button type="submit" icon={<ArrowIcon size={24} />} disabled={loading}>
                  {loading ? 'Enviando…' : 'Enviar mensagem'}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar */}
        {channels && channels.length > 0 && (
          <aside aria-label="Canais de contato">
            <p className="font-eyebrow m-0 mb-4">{sidebarEyebrow}</p>
            <div className="flex flex-col gap-6">
              {channels.map((channel) => (
                <ChannelRow
                  key={channel.id ?? channel.label}
                  iconKey={channel.icon}
                  label={channel.label}
                  value={channel.value}
                  hint={channel.hint}
                  href={channel.href}
                />
              ))}
            </div>
          </aside>
        )}
      </div>
    </section>
  )
}
