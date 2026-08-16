# Frontend

Nuxt UI frontend skeleton for Airton, intended for deployment on Cloudflare Pages.

## Setup

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

By default the app calls `http://127.0.0.1:8787`. Override it with `NUXT_PUBLIC_API_BASE_URL` when needed.

Set the backend worker's `ALLOWED_ORIGIN` variable to your deployed Pages domain before production use.

## Build

```bash
npm run build
```
