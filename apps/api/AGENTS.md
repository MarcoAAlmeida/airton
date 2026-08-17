# apps/api

A Python Cloudflare Worker (runs via Pyodide — Python compiled to
WebAssembly, sandboxed). Deployed via **Pywrangler**, not plain Wrangler.

## Commands

- `uv run pywrangler dev` — local dev
- `uv run pywrangler deploy` — deploy. Plain `wrangler deploy` will not
  vendor Python dependencies correctly; always go through pywrangler.
- Dependencies are declared in `pyproject.toml`.

## Real constraint on dependencies

Only pure-Python, PyEmscripten, or Pyodide-bundled packages work here —
no arbitrary C extensions, no real OS sockets. Libraries that need a real
event loop or native networking (Scrapy, real Playwright, anything
Twisted-based) cannot run in this Worker. That kind of work belongs in a
different sub-project (a Container, or a JS/TS Worker using
`@cloudflare/playwright`), not here.

## Auth on `/api/chat`

Two checks: `Origin` header must match `WEB_ORIGIN`, and
`x-airton-api-token` must match the `API_ACCESS_TOKEN` secret — which
must equal `apps/web`'s `NUXT_AIRTON_API_TOKEN` in the same environment.
The Origin check alone is not real security (spoofable by non-browser
callers); the shared-secret header is what actually gates access.
