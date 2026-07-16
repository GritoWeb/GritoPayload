'use client'

import React from 'react'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/react-splide/css/core'
import './testimonials.css'
import { TestimonialCard } from '@/components/ui/TestimonialCard'

type TestimonialItem = {
  id?: string | null
  quote: string
  author: string
  role?: string | null
  avatarVariant: 'blue' | 'orange'
  surface: 'paper' | 'card'
}

export function TestimonialsCarousel({ items }: { items: TestimonialItem[] }) {
  return (
    <>
      <Splide
        options={{
          type: 'loop',
          perPage: 1,
          arrows: false,
          pagination: true,
          gap: '2rem',
          autoHeight: true,
        }}
        aria-label="Depoimentos"
        className="testimonials-splide"
      >
        {items.map((item) => (
          <SplideSlide key={item.id ?? item.author}>
            <TestimonialCard
              quote={item.quote}
              author={item.author}
              role={item.role ?? undefined}
              avatarVariant={item.avatarVariant}
              surface={item.surface}
            />
          </SplideSlide>
        ))}
      </Splide>

    </>
  )
}
