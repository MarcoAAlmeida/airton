# Airton

A discovery project: exploring what's buildable with AI on Cloudflare. The
scope is intentionally not fixed — it starts with scraping product data
from different Sources across different vertical markets (hardware,
retail clothing, others as they come up) and answering questions about
that data via chat, but what we build and why will evolve as we learn
what's actually available and where the interesting opportunities are.

Architecture leans toward a distributed, event-sourced design with
scalability in mind by default — that's a deliberate exploration choice,
not just a requirement of the current feature set.

## Layout

This is a monorepo of independent sub-projects, each in its own top-level
folder with its own `AGENTS.md`. Each one can be opened and worked on as
if it were its own repository — read that folder's `AGENTS.md` for its
specific stack and conventions, not this one.

- `apps/web` — the frontend
- `apps/api` — the current backend
- `docs` — MkDocs documentation site (see below)

## Where to look for more

- `docs/content/architecture.md` — how the current system fits together
- `docs/content/roadmap/` — what's being built next, and why (evolves
  often — check here before assuming the current architecture is final)
