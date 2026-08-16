# AI coordination instructions

This repository hosts the first MVP skeleton for **Airton**, a Cloudflare-based AI chat assistant for business prospection.

## Project layout

- `backend/`: Cloudflare Workers AI backend
- `frontend/`: Nuxt UI frontend intended for Cloudflare Pages

## Coordination rules

1. Keep the backend and frontend deployable as separate Cloudflare projects.
2. Prefer small, reviewable changes that move the MVP forward.
3. Keep shared assumptions documented in the repository root before duplicating them across apps.
4. The frontend should talk to the backend through a configurable public base URL.
5. Avoid committing secrets; use Cloudflare bindings and environment variables instead.

## Current MVP direction

- Backend exposes a health endpoint and a minimal chat endpoint backed by Workers AI.
- Frontend provides a simple prospection-oriented chat interface and points to the backend through runtime config.
- Future work can expand authentication, persistence, lead sources, and prompt/instruction design.
