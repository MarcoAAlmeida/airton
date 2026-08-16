# Activity 01 — Scraper, RAG, and Agent

This is the plan for when we resume active build sessions. It has four
pieces, delivered across seven phases so each one lands as something
runnable rather than one large change.

For the Cloudflare-specific architecture behind this — which products,
and why — see the [deep dive](deep_dive.md).

## What we're building

**a) A scraper for a particular Source.** Not yet decided — leading
candidate is a local wholesale hardware store in Brazil, but it could end
up being something else entirely. The scraper design should not assume
too much about the specific site until we've picked it.

**b) Scrape runs that `apps/web` can trigger and follow.** A user starts a
scrape from the UI, and the UI polls until it finishes — success or
failure both need to be visible, not just a spinner that never resolves.

**c) Persisted product data, with a RAG built on top of it.** Whatever the
scraper extracts becomes queryable — not just stored, but embedded and
retrievable for grounding AI answers.

**d) An Agent that can answer questions about the scraped products.**
Plugged into the existing chat experience in `apps/web`.

## Phases

1. **Simple scraper** — touches only the chosen Source, extracts minimal
   info (enough to prove the pipeline end-to-end, not full product data
   yet).
2. **BFF UI endpoints** — `apps/web` server routes to trigger a scrape and
   report its current state.
3. **Modify `apps/web`** — UI to kick off the simple scrape from phase 1
   and poll its status via the phase 2 endpoints.
4. **Enhance scraping + persistence** — richer extraction, and product
   data actually stored somewhere durable.
5. **Build a RAG** — embed the persisted product data, make it
   retrievable.
6. **Define prompts and Agent framework** — decide how the Agent is
   built and how it's prompted.
7. **Enhance `apps/web` chat UX** — wire the Agent into the existing chat
   interface so it can actually be used.

Phases 1–3 form a thin vertical slice (scrape one thing, see it complete
in the UI) before phases 4–7 build out persistence, retrieval, and the
Agent on top of that foundation.
