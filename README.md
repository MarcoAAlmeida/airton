# Airton

Airton is a business-prospecting MVP. The first phase is a generic AI chat foundation that will later incorporate public business data, market insights, and opportunity analysis.

## Architecture

| Application | Purpose | Deployment |
| --- | --- | --- |
| `apps/web` | Nuxt UI chat interface | Cloudflare Pages |
| `apps/api` | Python chat API with a Workers AI binding | Cloudflare Workers |

The browser holds the active conversation in memory only. Nuxt Auth Utils stores the signed-in profile in a sealed cookie. The Pages server verifies that session, then proxies authenticated chat requests to the separate Worker with a server-only shared token.

## Prerequisites

- Node.js 24+ and pnpm 10+
- Python 3.12+ and [uv](https://docs.astral.sh/uv/)
- A Cloudflare account with Workers AI enabled

## Local development

Install JavaScript and Python dependencies:

```powershell
pnpm install
Set-Location apps\api
uv sync
Set-Location ..\..
```

Create uncommitted local configuration from the examples. The admin and client accounts are static environment variables for this MVP; they have no registration flow or database.

```powershell
Copy-Item apps\web\.env.example apps\web\.env
Copy-Item apps\api\.dev.vars.example apps\api\.dev.vars
```

Set a random `NUXT_SESSION_PASSWORD` of at least 32 characters, account emails/passwords, and a long `NUXT_AIRTON_API_TOKEN`. Set `API_ACCESS_TOKEN` in `apps\api\.dev.vars` to that same API token.

In one terminal, run the Worker. Workers AI is remote even during local development and may incur usage charges:

```powershell
pnpm dev:api
```

In a second terminal, run the web app:

```powershell
pnpm dev:web
```

## Deploy

1. In `apps/api`, run `pnpm run deploy -- --var WEB_ORIGIN:https://your-project.pages.dev`. Then use `wrangler secret put API_ACCESS_TOKEN` to set the Worker-side shared token.
2. Create a Cloudflare Pages project whose root directory is `apps/web`, build command is `pnpm run build`, and build output directory is `dist`.
3. Set these Pages environment variables: `NUXT_SESSION_PASSWORD`, `NUXT_AIRTON_ADMIN_EMAIL`, `NUXT_AIRTON_ADMIN_PASSWORD`, `NUXT_AIRTON_CLIENT_EMAIL`, `NUXT_AIRTON_CLIENT_PASSWORD`, `NUXT_AIRTON_API_URL`, and `NUXT_AIRTON_API_TOKEN`. The last value must match the Worker's `API_ACCESS_TOKEN`.
4. Redeploy Pages. Guests see the sign-in modal, while the two configured accounts receive their role-specific landing screens.

This is intentionally simple authentication for a controlled MVP. Replace static password environment variables with an identity provider and persistent users before a broader release.