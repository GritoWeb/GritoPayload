# Cache de queries do CMS — o que falta pra finalizar

Branch: `feat/cms-query-cache` (commit `acf5dea`).
A `main` **não** tem essas mudanças — foi mantida como estava.

## Contexto

As páginas públicas estavam `force-dynamic` **sem** incremental cache, então cada
visita re-renderizava e batia no D1 várias vezes. Era por isso que o site parecia tão
lento quanto WordPress: comparação cache × sem-cache, não Payload × WP.

Esta branch envolve todas as consultas ao D1 do caminho de render em `unstable_cache`
(data cache do Next), persistido em R2 pelo OpenNext e invalidado por tag no publish.
As páginas continuam SSR (rota `ƒ Dynamic` no build), mas **param de bater no D1** a cada
visita — o banco só é consultado quando o conteúdo muda. Preview/draft nunca é cacheado.

> Isto é a "opção segura" (data cache). O teto de velocidade (HTML 100% estático servido
> do edge) foi **adiado** de propósito: exigiria refatorar o `<html lang>` do layout raiz
> (que hoje lê `headers()`) e tirar o `draftMode()` do caminho padrão de render — mexe em
> SEO e no fluxo de preview. Fica como passo futuro.

## O que já está pronto (nesta branch)

- `open-next.config.ts`: incremental cache (R2) + tag cache (D1) + fila `direct`.
- `wrangler.jsonc`: bindings dedicados `NEXT_INC_CACHE_R2_BUCKET` e `NEXT_TAG_CACHE_D1`,
  **isolados** do D1/R2 do Payload (senão o `sync`/`verify-sync` quebra — eles comparam
  o banco e o bucket do Payload byte a byte).
- `src/lib/cacheTags.ts`: vocabulário de tags + TTL de backstop (1h).
- 7 queries cacheadas: páginas, posts, portfólios (single) + blocos BlogListing,
  PortfolioListing, LatestPosts, LatestPortfolios.
- Hooks de invalidação: Pages/Posts corrigidos (invalidam **pt e en**), **hook de
  Portfolios criado** (não existia), hooks de Tags/PortfolioTags adicionados.
- `POST /api/revalidate` (purge manual, protegido por `REVALIDATE_SECRET`).
- Verificado: `tsc --noEmit` = 0 erros; `next build` passa.
- **Não há migration nova** — nada mudou no schema (só código/config/hooks).

## O que falta pra ir ao ar

Tudo abaixo é **escrita em produção** na conta `suporte@gritoweb.com.br`. Não é serviço
novo: são só um bucket R2 e um banco D1 a mais (mesmos produtos que o site já usa),
pendurados no mesmo worker `grito-web`. Custo praticamente zero (dentro do free tier).

### 1. Provisionar a infra de cache (uma vez)

```bash
# Bucket R2 do incremental cache
wrangler r2 bucket create grito-web-next-cache

# Banco D1 do tag cache
wrangler d1 create grito-web-next-tag-cache
```

O `d1 create` imprime um `database_id`. Cole-o no `wrangler.jsonc`, no lugar do
placeholder **`REPLACE_WITH_D1_CREATE_OUTPUT`** (binding `NEXT_TAG_CACHE_D1`), e comite.

> A tabela `revalidations` do tag cache é criada automaticamente no deploy pelo
> `opennextjs-cloudflare` (populateCache) — não precisa criar à mão.

### 2. Definir o secret do purge manual

```bash
openssl rand -hex 32              # gere um valor
wrangler secret put REVALIDATE_SECRET   # cole o valor quando pedir
```

(E adicione `REVALIDATE_SECRET` no `.env` local, se for testar o purge em dev/preview.)

### 3. Deploy

Pare o `pnpm dev` antes (ele briga com o `pnpm deploy` pelo `.next/`), depois:

```bash
pnpm deploy
```

`deploy:database` roda `payload migrate` (no-op aqui, sem schema novo) e `deploy:app`
faz o build OpenNext + deploy — é aí que o `populateCache` cria a tabela `revalidations`
no D1 novo.

## Verificação pós-deploy

1. **Cache ligando:** a 2ª visita à mesma página deve vir do cache.
   ```bash
   BASE=https://grito-web.suporte-fd8.workers.dev
   curl -s -o /dev/null -w "TTFB=%{time_starttransfer}s  cache=%{header_json}\n" "$BASE/"
   # ou olhe o header x-nextjs-cache: HIT/MISS
   curl -sI "$BASE/" | grep -i "x-nextjs-cache\|cf-cache-status"
   ```
   Espere `MISS` na 1ª, `HIT` na 2ª.

2. **Invalidação no publish:** edite e publique uma página no `/admin` → recarregue a
   página pública → a mudança aparece na hora (sem esperar o TTL).

3. **Purge manual (usar após `sync:prod`, que NÃO passa pelos hooks):**
   ```bash
   curl -X POST "$BASE/api/revalidate?secret=$REVALIDATE_SECRET"            # tudo
   curl -X POST "$BASE/api/revalidate?secret=$REVALIDATE_SECRET&tag=posts"  # uma tag
   curl -X POST "$BASE/api/revalidate?secret=$REVALIDATE_SECRET&path=/portfolio/acme"
   ```

## Como funciona a limpeza de cache (resumo)

| Ação | Limpa cache? |
|---|---|
| Editar/publicar pelo admin | ✅ automático (tag revalidation, na hora) |
| Editar Header/Footer | ✅ automático |
| `pnpm sync:prod` (conteúdo em massa) | ❌ precisa purge manual (ou espera o TTL de 1h) |
| Deploy de código | ✅ recria tudo |

> O cache **só** atua sob `pnpm preview`/`pnpm deploy` (runtime OpenNext). Em `pnpm dev`
> o Next usa o cache em memória padrão e ignora os bindings — normal, não é bug.

## Rollback

- **Código:** a `main` não tem nada disso; basta não fazer merge, ou reverter o commit
  `acf5dea`.
- **Runtime:** removendo os bindings do `wrangler.jsonc` e voltando o `open-next.config.ts`
  pro default, o site volta ao SSR sem cache. Os recursos R2/D1 criados podem ficar (custo ~0)
  ou ser apagados (`wrangler r2 bucket delete` / `wrangler d1 delete`).
- **Dados:** nada destrutivo — nenhuma migration, nenhuma alteração no banco de conteúdo.
