# Airton web

Nuxt UI frontend for Airton's streaming chat. It keeps the active conversation in browser memory and calls the separate Python Worker API.

Set `NUXT_PUBLIC_API_BASE` to the Worker URL for deployed environments. The local default is `http://localhost:8787`.

```powershell
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
```
