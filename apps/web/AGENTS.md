# apps/web

Nuxt 4 + Nuxt UI 4 frontend, package manager is `pnpm`. Deployed on
Cloudflare Pages (nitro `cloudflare-pages` preset).

## Commands

- `pnpm dev` — local dev server
- `pnpm build` — production build; output lands in `dist`, not
  `.output/public` (the nitro preset's actual output dir — this has
  broken CI config before, don't assume the generic Nuxt default)
- `pnpm typecheck` — runs `nuxt typecheck`, not plain `tsc`
- `pnpm lint`

## Auth model

There is no user database. `server/api/auth/login.post.ts` checks
credentials against exactly two accounts (`admin`, `client`) sourced from
env vars, and seals the session into a cookie via `nuxt-auth-utils`. If a
task implies "add a new user," that means a new env-var-backed account,
not a database row.

## Talking to apps/api

The browser never calls `apps/api` directly. `server/api/chat.post.ts`
proxies it, attaching the `x-airton-api-token` header
(`NUXT_AIRTON_API_TOKEN`). That value must exactly match `apps/api`'s
`API_ACCESS_TOKEN` secret in whatever environment you're pointed at, or
every chat request 401s.
