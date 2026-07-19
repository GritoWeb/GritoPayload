# Claude Code

This project uses the Payload CMS skill at `.claude/skills/payload/`.
Start with `.claude/skills/payload/SKILL.md` for a quick reference, then see `.claude/skills/payload/reference/` for detailed docs.

---

## ⚠️ Critical Rules

Adapted from [GritoWeb/wordpress-standards-workflow](https://github.com/GritoWeb/wordpress-standards-workflow/blob/master/CLAUDE.md) — the rules that apply to this stack:

- **Never `git push` without permission.**
- **Never write to production / a remote environment without explicit permission.** Read-only commands against the remote (SELECTs via `wrangler d1 execute --remote`, dry-runs, `curl` on the live site) are free; writes (`pnpm deploy`, `CONFIRM=1 pnpm sync:prod`, remote D1 mutations, remote R2 uploads/deletes) need an explicit ask.
- **Never add `Co-authored-by`** (or any AI attribution) in commit messages.
- **Never modify third-party code** — nothing inside `node_modules/`; extend via config or wrappers instead.
- **English** for all commit messages, comments, and variables (conversation stays in pt-BR).
- **Never assume** — when unclear, stop and ask.
- **Don't just agree** — push back on flawed requests with explanation.

---

# Guia de Setup — Nova Máquina

Este documento é para o Claude ajudar um desenvolvedor a inicializar o projeto do zero após clonar o repositório.

## O que é este projeto

Next.js 15 + Payload CMS 3 rodando em **Cloudflare Workers**. O banco de dados é **D1 (SQLite)** e o storage de arquivos é **R2**, ambos da Cloudflare.

- Em **desenvolvimento local**: usa D1 local (arquivo SQLite na máquina, sem precisar de conta Cloudflare)
- Em **produção**: usa D1 e R2 remotos na conta Cloudflare

---

## Pré-requisitos obrigatórios

Antes de qualquer coisa, verificar se estão instalados:

```bash
node --version   # deve ser >= 20.9.0
pnpm --version   # deve ser >= 9
```

Se `pnpm` não estiver instalado:
```bash
npm install -g pnpm
```

---

## Setup passo a passo

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Criar o arquivo `.env`

Copiar o `.env.example` e preencher:

```bash
cp .env.example .env
```

Abrir o `.env` e preencher:

```env
PAYLOAD_SECRET=qualquer_string_aleatoria_longa
PREVIEW_SECRET=local-preview-secret
```

Para gerar um `PAYLOAD_SECRET` seguro:
```bash
openssl rand -hex 32
```

### 3. Rodar as migrations locais

Isso cria o banco SQLite local com todas as tabelas necessárias:

```bash
pnpm payload migrate
```

> Aguarda alguns segundos. Deve terminar com `"msg":"Done."`. O banco local fica em `.wrangler/state/v3/d1/`.

### 4. Iniciar o servidor de desenvolvimento

```bash
pnpm dev
```

Acesse:
- **Frontend:** http://localhost:3000
- **Painel admin:** http://localhost:3000/admin

Na primeira vez, o admin vai pedir para criar um usuário. Crie normalmente.

---

## Estrutura do projeto

```
src/
├── app/
│   ├── (frontend)/          # Páginas públicas do site
│   │   └── [slug]/page.tsx  # Rota dinâmica de páginas
│   └── (payload)/           # Admin do Payload CMS
├── blocks/                  # Blocos de conteúdo (FaqBlock, etc.)
├── collections/             # Collections do Payload (Pages, Media, Users)
├── components/              # Componentes React reutilizáveis
├── Header/ Footer/          # Globals do Payload
├── migrations/              # Migrations do banco D1
├── utilities/               # Funções utilitárias
└── payload.config.ts        # Configuração central do Payload
```

---

## Problemas comuns no setup

### `pnpm payload migrate` trava ou dá erro de conexão

Em desenvolvimento, as migrations rodam localmente — **não precisam de internet**. Se travar, verifique:
- O `.env` existe e tem `PAYLOAD_SECRET` preenchido
- Tente limpar e rodar de novo:
  ```bash
  rm -rf .wrangler
  pnpm payload migrate
  ```

### Erro `Cannot find module` ou tipos faltando após `pnpm install`

Regenerar os tipos do Payload e do Cloudflare:
```bash
pnpm generate:types
```

### Admin abre mas dá erro 500

Provavelmente as migrations não foram rodadas. Execute:
```bash
pnpm payload migrate
```

### Porta 3000 já em uso

```bash
pnpm dev -- --port 3001
```

### `pnpm dev` trava no "Starting..."

Tente o modo seguro que limpa cache antes:
```bash
pnpm devsafe
```

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `PAYLOAD_SECRET` | Sim | Chave secreta do Payload para JWT/sessões. Pode ser qualquer string longa. |
| `PREVIEW_SECRET` | Não | Senha para preview de rascunhos. Pode deixar `local-preview-secret`. |

---

## Scripts disponíveis

| Comando | O que faz |
|---|---|
| `pnpm dev` | Inicia o servidor de desenvolvimento |
| `pnpm devsafe` | Limpa cache e inicia o dev |
| `pnpm payload migrate` | Aplica migrations pendentes no banco local |
| `pnpm payload migrate:create` | Gera uma nova migration (após mudar o schema) |
| `pnpm generate:types` | Regenera tipos TypeScript do Payload e Cloudflare |
| `pnpm build` | Build de produção |
| `pnpm lint` | Verifica erros de lint |

---

## Informações de produção (Cloudflare)

Consulte o `DEPLOY.md` para o processo completo de deploy.

- **Worker:** `grito-web`
- **D1:** `cloudflare-payload-db` (ID: `2441aab2-5f9e-4240-ab99-e1d5bcde15e8`)
- **R2:** `cloudflare-payload-r2`
- **URL:** https://grito-web.suporte-fd8.workers.dev
- **Conta Cloudflare:** suporte@gritoweb.com.br
