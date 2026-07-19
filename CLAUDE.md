# Claude Code

This project uses the Payload CMS skill at `.claude/skills/payload/` — start with `SKILL.md`, details in `reference/`.

## ⚠️ Critical Rules

Adapted from [GritoWeb/wordpress-standards-workflow](https://github.com/GritoWeb/wordpress-standards-workflow/blob/master/CLAUDE.md) — the rules that apply to this stack:

- **Never `git push` without permission.**
- **Never write to production / a remote environment without explicit permission.** Read-only commands against the remote (SELECTs via `wrangler d1 execute --remote`, dry-runs, `curl` on the live site) are free; writes (`pnpm deploy`, `CONFIRM=1 pnpm sync:prod`, remote D1 mutations, remote R2 uploads/deletes) need an explicit ask.
- **Never add `Co-authored-by`** (or any AI attribution) in commit messages.
- **Never modify third-party code** — nothing inside `node_modules/`; extend via config or wrappers instead.
- **English** for all commit messages, comments, and variables (conversation stays in pt-BR).
- **Never assume** — when unclear, stop and ask.
- **Don't just agree** — push back on flawed requests with explanation.

## The project

Next.js 15 + Payload CMS 3 running on **Cloudflare Workers**. **D1** (SQLite) database, files on **R2**. Local dev uses miniflare's local D1/R2 (`.wrangler/state/`, no internet needed); production uses the remote ones.

Setup from scratch: `pnpm install` → `cp .env.example .env` (generate `PAYLOAD_SECRET` with `openssl rand -hex 32`) → `pnpm payload migrate` → `pnpm dev` (admin at `/admin`). Available scripts: see `package.json`.

## Operational rules and gotchas

- **Content sync**: `pnpm sync:local` (prod → local) and `CONFIRM=1 pnpm sync:prod` (local → prod). Both fully **overwrite** the destination, no merge; without `CONFIRM=1`, sync:prod is a dry-run. `pnpm tsx scripts/verify-sync.ts` validates row by row (read-only). Local is the source of truth.
- **`pnpm deploy` and `pnpm dev` fight over `.next/`** — stop the dev server before deploying, then restart it. Deploy is only needed for code/schema; content goes via `sync:prod`.
- In scripts using `getPlatformProxy`, `R2.put` requires `new Blob([buf])` — Buffer breaks in miniflare (workers-sdk#6047).
- Corrupted/outdated local database: `rm -rf .wrangler && pnpm payload migrate`. Dev stuck at "Starting…": `pnpm devsafe`.
- Changed the schema? `pnpm payload migrate:create` + `pnpm generate:types`.

## Production (Cloudflare)

Deploy: `pnpm deploy` (full process in `DEPLOY.md`). D1 rollback: Time Travel (sync:prod prints the bookmark).

- **Worker:** `grito-web` · **URL:** https://grito-web.suporte-fd8.workers.dev
- **Account:** suporte@gritoweb.com.br · D1/R2 bindings in `wrangler.jsonc`
