'use client'

import React, { useState } from 'react'
import { Button, toast, useLocale } from '@payloadcms/ui'

/**
 * Header action that drops every cached page and CMS query.
 *
 * Publishing already clears the cache for whatever changed, so this is only
 * needed when content reaches the database from outside the admin (a
 * `sync:prod`, a manual fix). It stays a single click with no confirmation
 * because the worst case is a slower next page load.
 *
 * Styling comes from Payload's own Button and toast so it sits in the header
 * like a native control rather than a bolted-on one.
 */

// Follows the content locale picked in the header, which is the only language
// switch this panel exposes: `i18n` is not configured, so Payload's own chrome
// is English-only and its `language` would always read `en`.
const COPY = {
  en: {
    idle: 'Clear cache',
    working: 'Clearing…',
    success: 'Cache cleared. The site is now showing the latest content.',
    failure: 'Could not clear the cache. Please try again.',
  },
  pt: {
    idle: 'Limpar cache',
    working: 'Limpando…',
    success: 'Cache limpo. O site já está mostrando o conteúdo mais recente.',
    failure: 'Não foi possível limpar o cache. Tente novamente.',
  },
} as const

export default function ClearCacheButton() {
  const [isWorking, setIsWorking] = useState(false)
  const locale = useLocale()

  const copy = locale?.code?.startsWith('pt') ? COPY.pt : COPY.en

  const clear = async () => {
    if (isWorking) return
    setIsWorking(true)

    try {
      const response = await fetch('/api/revalidate-all', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        toast.success(copy.success)
      } else {
        toast.error(copy.failure)
      }
    } catch {
      toast.error(copy.failure)
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <Button
      buttonStyle="secondary"
      size="small"
      onClick={clear}
      disabled={isWorking}
      aria-label={copy.idle}
    >
      {isWorking ? copy.working : copy.idle}
    </Button>
  )
}
