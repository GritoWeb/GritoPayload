'use client'

import Image, { type ImageProps } from 'next/image'
import { useEffect, useRef, useState } from 'react'

/**
 * Next.js Image that fades in once it has scrolled into the viewport AND
 * finished loading.
 *
 * Gating on load matters: the IntersectionObserver can fire before the
 * (lazy-loaded) image has any pixels. If we revealed then, the opacity
 * transition would run on an empty box and the image would just pop in when it
 * finally arrives. So `.is-visible` is added only when in-view AND loaded.
 *
 * The initial `opacity: 0` comes from the `.fade-in-img` class (rendered on the
 * server, so there's no flash). Users with `prefers-reduced-motion` never get
 * the hidden state (handled in CSS), and environments without
 * IntersectionObserver reveal the image as soon as it loads.
 */
export function FadeInImage({ className, alt, onLoad, priority, ...props }: ImageProps) {
  const ref = useRef<HTMLImageElement | null>(null)
  const [inView, setInView] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Cached images won't fire onLoad — reveal immediately without waiting for
    // the IntersectionObserver, which may never fire during page transitions.
    if (el.complete && el.naturalWidth > 0) {
      setLoaded(true)
      setInView(true)
      return
    }

    // Priority images are already in view — skip the IntersectionObserver.
    if (priority) {
      setInView(true)
      return
    }

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.01 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [priority])

  // Priority images are the LCP candidate: they sit above the fold, so the fade
  // buys nothing and costs everything. `.fade-in-img` starts at `opacity: 0` and
  // only clears once React has hydrated, and an invisible pixel does not count as
  // painted — which parked LCP behind a full hydration cycle (measured: 3.4s of
  // render delay against 125ms of actual download).
  const merged = priority
    ? className
    : ['fade-in-img', inView && loaded && 'is-visible', className].filter(Boolean).join(' ')

  return (
    <Image
      {...props}
      priority={priority}
      ref={ref}
      alt={alt}
      className={merged}
      onLoad={(event) => {
        setLoaded(true)
        onLoad?.(event)
      }}
      onError={() => { setLoaded(true) }}
    />
  )
}
