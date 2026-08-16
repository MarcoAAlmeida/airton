# Airton API

This Python Cloudflare Worker serves `POST /api/chat`. It validates a bounded client transcript and streams a Workers AI response without exposing Cloudflare credentials to the browser. `GET /` returns a public health response with the API status and chat endpoint.

## Configuration

`WEB_ORIGIN` is the only allowed browser origin. It defaults to `http://localhost:3000` for Nuxt development. Replace it with the deployed Pages URL before production deployment.

`API_ACCESS_TOKEN` is required on each chat request through the `x-airton-api-token` header. The Nuxt Pages server adds this header only after it verifies the user's sealed session cookie. Set the same value as `NUXT_AIRTON_API_TOKEN` in the web app; never expose it as a public runtime variable.

Workers AI is exposed by the `AI` binding in `wrangler.jsonc`. The selected model is defined in `src/entry.py`.

## Commands

```powershell
uv sync
pnpm dev
pnpm check
pnpm deploy
```
