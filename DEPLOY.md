# Deploy — Cloudflare Workers

Este projeto usa **Next.js + Payload CMS** rodando em **Cloudflare Workers** com banco **D1** e storage **R2**.

---

## Pré-requisitos

1. **Node.js** e **pnpm** instalados
2. **Wrangler** autenticado na conta correta:
   ```bash
   wrangler login
   # Confirme com:
   wrangler whoami
   # Deve mostrar: suporte@gritoweb.com.br
   ```
3. Variáveis de ambiente configuradas no `.env` (veja `.env.example` se existir)

---

## Fluxo de deploy completo

### Passo 1 — Aplicar migrations ao D1 (banco remoto)

Sempre que houver mudanças no schema do Payload (novas collections, globals, campos), você precisa:

**1a. Gerar a migration:**
```bash
pnpm payload migrate:create
```
Isso cria um novo arquivo em `src/migrations/` e atualiza o `src/migrations/index.ts` automaticamente.

**1b. Aplicar a migration no D1 remoto:**
```bash
NODE_ENV=production PAYLOAD_SECRET=ignore pnpm payload migrate
```
> Aguarda ~1 minuto para rodar remotamente no D1.

### Passo 2 — Build + Deploy do Worker

```bash
pnpm run deploy:app
```

Se o comando `opennextjs-cloudflare deploy` travar com erro `ETIMEDOUT` (problema de conectividade com a API de preview da Cloudflare), use diretamente:

```bash
wrangler deploy
```

> O `wrangler deploy` detecta automaticamente o projeto OpenNext e chama o deploy corretamente.

---

## Comando rápido (quando não há mudança de schema)

```bash
wrangler deploy
```

---

## Quando usar cada abordagem

| Situação | O que fazer |
|---|---|
| Só mudou código (componentes, páginas, estilos) | `wrangler deploy` |
| Adicionou/alterou collection, global ou campo no Payload | `pnpm payload migrate:create` → `NODE_ENV=production PAYLOAD_SECRET=ignore pnpm payload migrate` → `wrangler deploy` |
| Primeira vez configurando o banco | Rodar todas as migrations: `NODE_ENV=production PAYLOAD_SECRET=ignore pnpm payload migrate` |

---

## Problemas conhecidos e soluções

### `ETIMEDOUT` ao rodar `pnpm run deploy` ou `pnpm run deploy:app`

O `opennextjs-cloudflare deploy` tenta criar uma sessão proxy remota para obter variáveis de ambiente e às vezes a conexão trava com timeout.

**Solução:** use `wrangler deploy` diretamente após o build estar pronto em `.open-next/`.

### `@ts-expect-error` unused — erro no build

Se o TypeScript resolver um tipo que antes precisava de supressão, o build quebra com:
```
Type error: Unused '@ts-expect-error' directive.
```
**Solução:** remover o comentário `@ts-expect-error` do arquivo indicado.

### `no such table` — 500 no site após deploy

O banco D1 não tem as tabelas necessárias. Acontece quando collections ou globals foram adicionados mas a migration não foi gerada/aplicada.

**Diagnóstico:**
```bash
wrangler tail --format json --status error
```
Se aparecer `D1_ERROR: no such table: <nome>`, é migration faltando.

**Solução:**
```bash
pnpm payload migrate:create
NODE_ENV=production PAYLOAD_SECRET=ignore pnpm payload migrate
```

### `generateStaticParams` quebrando o build

Funções `generateStaticParams` que consultam o banco D1 durante `next build` falham porque não há conexão remota disponível nesse contexto.

**Solução:** adicionar `export const dynamic = 'force-dynamic'` na page e remover o `generateStaticParams` (no Cloudflare Workers as páginas são servidas dinamicamente mesmo).

---

## Busca full-text dos posts (FTS5)

A busca do blog usa uma tabela virtual SQLite **FTS5** (`posts_fts`) no D1, sincronizada
via hooks do Payload (apenas posts **publicados**, todos os locales). Detalhes em
`src/migrations/20260615_141615_add_posts_fts.ts`, `src/lib/postsSearchIndex.ts` e
`src/collections/Posts/hooks/syncPostSearchIndex.ts`. O endpoint é `GET /api/search`.

**Aplicar a migration + popular o índice** (local):
```bash
pnpm payload migrate
pnpm reindex:search        # = pnpm tsx scripts/reindex-search.ts
```
Em produção a migration entra junto do `pnpm run deploy:database`; rode o reindex uma vez
após o primeiro deploy (ou sempre que recriar a tabela).

> ⚠️ **Export do D1:** o D1 **não exporta** bancos que contêm tabelas virtuais. Para rodar
> `wrangler d1 export` é preciso primeiro `DROP TABLE posts_fts`, exportar, e então recriar
> a tabela (re-aplicar a migration + `pnpm reindex:search`).

> 💾 **Storage:** o índice FTS consome ~2–3× o tamanho do texto puro indexado. Lembre do
> limite de 10 GB do D1.

---

## Cache (data cache / ISR)

As páginas públicas rodam SSR no worker, mas as consultas ao D1 (páginas, posts,
portfólios e as listagens) são cacheadas no **data cache** do Next (`unstable_cache`),
que o OpenNext persiste no **R2** e invalida via **tag cache** no **D1**. Resultado:
o banco só é consultado quando o conteúdo muda, não a cada visita.

- **Invalidação automática:** os hooks `afterChange`/`afterDelete` das collections
  chamam `revalidateTag(...)` no publish → a página reflete na hora. Preview/draft
  nunca é cacheado.
- **Backstop:** TTL de 1h (`CACHE_TTL` em `src/lib/cacheTags.ts`) que autocorrige
  conteúdo subido por `pnpm sync:prod` (que escreve direto no D1, **sem** passar pelos hooks).
- **Purge manual:** `POST /api/revalidate` protegido por `REVALIDATE_SECRET`
  (ver `.env.example`). Use após um `sync:prod` para refletir na hora em vez de esperar o TTL:
  ```bash
  # purga tudo
  curl -X POST "$BASE_URL/api/revalidate?secret=$REVALIDATE_SECRET"
  # purga uma rota / uma tag
  curl -X POST "$BASE_URL/api/revalidate?secret=$REVALIDATE_SECRET&path=/portfolio/acme"
  curl -X POST "$BASE_URL/api/revalidate?secret=$REVALIDATE_SECRET&tag=posts"
  ```

> ⚠️ O cache **só** atua sob `pnpm preview`/`pnpm deploy` (runtime OpenNext). Em
> `pnpm dev` o Next usa o cache em memória padrão — os bindings de cache são ignorados.

### Provisionamento (uma vez, antes do primeiro deploy com cache)

Os stores de cache são **dedicados** (separados do D1/R2 do Payload) para não
interferir no `sync`. Crie-os e cole o `database_id` no `wrangler.jsonc`:

```bash
# Bucket R2 para o incremental cache (binding NEXT_INC_CACHE_R2_BUCKET)
wrangler r2 bucket create grito-web-next-cache

# Banco D1 para o tag cache (binding NEXT_TAG_CACHE_D1)
wrangler d1 create grito-web-next-tag-cache
# → copie o database_id retornado para o campo "REPLACE_WITH_D1_CREATE_OUTPUT" em wrangler.jsonc
```

A tabela `revalidations` do tag cache é criada automaticamente no deploy pelo
`opennextjs-cloudflare` (populateCache) — não precisa criar à mão. Defina também
`REVALIDATE_SECRET` no ambiente do worker (`wrangler secret put REVALIDATE_SECRET`).

---

## Estrutura de recursos na Cloudflare

| Recurso | Nome | Binding |
|---|---|---|
| Worker | `grito-web` | — |
| Banco D1 (conteúdo) | `cloudflare-payload-db` | `D1` |
| Storage R2 (mídia) | `cloudflare-payload-r2` | `R2` |
| R2 (cache incremental) | `grito-web-next-cache` | `NEXT_INC_CACHE_R2_BUCKET` |
| D1 (tag cache) | `grito-web-next-tag-cache` | `NEXT_TAG_CACHE_D1` |

**URL de produção:** https://grito-web.suporte-fd8.workers.dev

---

## Ver logs em tempo real

```bash
wrangler tail --format pretty
```

Para filtrar só erros:
```bash
wrangler tail --format json --status error
```
