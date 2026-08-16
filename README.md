# airton

Bare skeleton for a Cloudflare-based AI chat assistant focused on business prospection.

## Repository structure

- `backend/` — Cloudflare Workers AI backend
- `frontend/` — Nuxt UI frontend for Cloudflare Pages
- `AGENTS.md` — repo-level AI coordination instructions

## Getting started

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

For local development, the frontend expects the backend at `http://127.0.0.1:8787` unless `NUXT_PUBLIC_API_BASE_URL` is set.

Before deploying the backend, set `ALLOWED_ORIGIN` to your actual Cloudflare Pages domain.