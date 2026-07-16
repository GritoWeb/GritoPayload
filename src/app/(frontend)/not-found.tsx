import React from 'react'
import { Button } from '@/home/primitives'
import { Sparkle, DotGrid } from '@/home/illustrations'
import { ArrowIcon } from '@/components/ui/ArrowIcon'

export default function NotFound() {
  return (
    <section className="relative px-5 py-10  lg:py-24 overflow-hidden">
      <DotGrid
        cols={10}
        rows={5}
        color="#1A5EAB"
        opacity={0.18}
        className="absolute top-10 right-10 hidden md:block"
      />

      <div className="container flex flex-col items-center">
        <p className="font-eyebrow m-0 mb-4">Erro 404</p>

        <div className="relative inline-block mb-6">
          <Sparkle size={36} color="#282828" className="absolute -top-4 -right-8" />
          <Sparkle size={22} color="#FE9D2B" className="absolute -bottom-2 -left-6" />
          <p className="m-0 font-display font-black text-blue text-[5.5rem] leading-none tracking-tight select-none">
            4<span className="text-orange">0</span>4
          </p>
        </div>

        <h1 className="m-0 text-blue text-h1 font-bold leading-tight">
          Página não encontrada
        </h1>

        <p className="body-text text-mute mt-4 max-w-xl">
          Essa URL não existe ou o conteúdo foi movido. Confira se o endereço está correto ou use
          os links abaixo para continuar navegando.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/" icon={<ArrowIcon size={24} />}>
            Voltar ao início
          </Button>
        </div>
      </div>
    </section>
  )
}
