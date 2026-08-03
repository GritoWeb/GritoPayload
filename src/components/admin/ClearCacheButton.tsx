'use client'

import React, { useState } from 'react'
import { Button, toast } from '@payloadcms/ui'

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
export default function ClearCacheButton() {
  const [isWorking, setIsWorking] = useState(false)

  const clear = async () => {
    if (isWorking) return
    setIsWorking(true)

    try {
      const response = await fetch('/api/revalidate-all', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        toast.success('Cache cleared — the next visit rebuilds from the database.')
      } else {
        toast.error('Could not clear the cache. Try again.')
      }
    } catch {
      toast.error('Could not clear the cache. Try again.')
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
      aria-label="Clear the site cache"
    >
      {isWorking ? 'Clearing…' : 'Clear cache'}
    </Button>
  )
}
