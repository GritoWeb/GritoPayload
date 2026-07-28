# Changelog

## 2026-07-28

### Fixed

- **Imagens quebradas em produção (Cloudflare Workers) via `/_next/image`.** Todo `<Image>` do Next
  apontando pra mídia do Payload (`/api/media/file/...`) devolvia 404 com
  `"url" parameter is valid but upstream response is invalid` em produção, mas funcionava normal em
  `next dev` local — nenhuma imagem nova ou antiga do case era afetada localmente, só em produção.
  Causa raiz: bug conhecido do `@opennextjs/cloudflare` (v1.19.9). O handler de `/_next/image`
  (`dist/cli/templates/images.js`) trata qualquer URL local (que começa com `/`) como se fosse asset
  estático e busca só via `env.ASSETS.fetch()`, que só enxerga arquivos empacotados no build. A rota
  de mídia do Payload é dinâmica (Payload → R2 via `@payloadcms/storage-r2`), nunca existe como asset
  estático, então sempre 404 nesse caminho — independente de qual imagem ou de quando foi enviada.
  Mesmo bug reproduzido e confirmado no repositório do Payload CMS
  ([payloadcms/payload#15502](https://github.com/payloadcms/payload/issues/15502)), na mesma
  combinação de versões (Next 15.4.11 + `@payloadcms/storage-r2`). Sem correção lançada em nenhuma
  versão do `@opennextjs/cloudflare` até a 1.20.2 (changelog do pacote conferido).
  Corrigido com um patch via `pnpm patch` (`patches/@opennextjs__cloudflare.patch`, registrado em
  `pnpm-workspace.yaml` → `patchedDependencies`, reaplicado automaticamente em todo `pnpm install`)
  que remove o atalho exclusivo do `ASSETS` para URLs locais e unifica esse caminho com o mesmo
  `fetchWithRedirects` já usado para URLs remotas — mesma lógica de fetch, sem tratamento especial
  por origem.
  Alternativas descartadas por decisão do time: Cloudflare Images binding e loader customizado via
  `/cdn-cgi/image/` — ambas dependem de um serviço adicional da Cloudflare, o que não era desejado
  aqui.
  Verificado: build + `opennextjs-cloudflare preview` local contra D1/R2 remotos reais de produção —
  todas as imagens do case `/portfolio/griddl` (`cbwcd-desktop.webp`, `massavemudroom-mobile-hero.webp`,
  `interfacegroup-desktop.png`, `blackboot-mobile.webp`) voltaram a 200, e os assets estáticos que já
  funcionavam (`favicon.png`, `balao-branco.png` — que usavam justamente o caminho `ASSETS` removido)
  continuaram 200, sem regressão. Deploy em produção confirmado via `wrangler deploy`
  (Version ID `b50e53f7-d606-4349-a830-5b7064399e03`) — mesmas imagens reconferidas direto em
  `https://grito-web.suporte-fd8.workers.dev/portfolio/griddl`, todas 200.
