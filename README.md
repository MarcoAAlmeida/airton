# airton

Bare skeleton for a Cloudflare-based AI chat assistant focused on business prospection.

## Repository structure

- `/home/runner/work/airton/airton/backend` — Cloudflare Workers AI backend
- `/home/runner/work/airton/airton/frontend` — Nuxt UI frontend for Cloudflare Pages
- `/home/runner/work/airton/airton/AGENTS.md` — repo-level AI coordination instructions

## Getting started

### Backend

```bash
cd /home/runner/work/airton/airton/backend
npm install
npm run dev
```

### Frontend

```bash
cd /home/runner/work/airton/airton/frontend
npm install
npm run dev
```

For local development, the frontend expects the backend at `http://127.0.0.1:8787` unless `NUXT_PUBLIC_API_BASE_URL` is set.