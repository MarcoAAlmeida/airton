# Spec strategy: contracts now, OpenSpec later

Where this came from: [OpenSpec](https://openspec.dev/), a spec-driven
development framework — specs are living requirement docs per capability,
and `changes/` hold proposals (proposal, design, tasks, spec deltas)
reviewed before implementation.

Worth being precise about one thing: the tool's actual default is a
single `openspec/` directory with `specs/` and `changes/`. It has **no
documented guidance for monorepos or nested spec layers per
sub-project**. The idea of a root `.openspec/` (contracts only) plus a
local `.openspec/` per sub-project was a third party's adaptation of
OpenSpec's concepts to a monorepo, not something the tool prescribes
out of the box. We're adopting the *concept*, not treating that tree as
an official pattern.

## The boundary rule we're adopting

- The **root** spec layer owns only contracts and plumbing — shared
  event shapes, `scrape_id` semantics, whatever interface sits between
  sub-projects. It should never contain a sub-project's internal detail.
- Each **sub-project** owns its own local spec for its internal domain
  logic.
- A breaking change to a shared contract is proposed **at the root
  first**. Local specs only change after the root contract does.

This is the same boundary discipline behind the
[AGENTS.md strategy](agents-md-strategy.md), applied to requirements
instead of working instructions: root stays generic, sub-projects own
their own detail.

## Why phased, and why not the CLI yet

The sub-projects this would eventually cover — scraper, RAG, Agent — don't
exist as code yet, so there's nothing for a local spec to describe and no
second sub-project yet to enforce a contract boundary against. Writing
those specs now would mean documenting structure that doesn't exist,
which is exactly the failure mode we already flagged for `AGENTS.md`.

We're also not installing the OpenSpec CLI (`@fission-ai/openspec`) yet.
It brings its own proposal/review ceremony and slash commands — real
process overhead that should be earned, not adopted on the strength of
one article. Plain markdown gets us the boundary discipline without the
extra dependency; we can graduate to the actual tool once the lightweight
version proves itself.

Specs, once they exist, will **not** live under `docs/content/` — that
tree is human-facing narrative (architecture description, roadmap,
decisions like this one). A spec is a contract other agents and devs
check before changing code, so it belongs next to `AGENTS.md` at the
repo root and at each sub-project root, not inside the documentation
site.

## Status — this is the register of intent

- **Now:** no spec files exist yet. This page is the only record of the
  decision.
- **Next (not started):** when [Activity 01](../roadmap/activity-01/index.md)'s
  phase 1 (the first scraper) actually begins, create a root-level
  `contracts.md` pinning down the shared event shapes
  (`scrape.requested` / `page.scraped` / `scrape.completed` /
  `scrape.failed`) and `scrape_id` semantics we designed in conversation,
  before any scraper code is written against them.
- **Later (not started):** local specs per sub-project, once each one
  exists as real code. Full OpenSpec CLI adoption (proposals, deltas,
  review workflow) only if and when a second sub-project genuinely needs
  boundary enforcement against the first — not before.

## Migration direction for existing docs

Where a future spec and an existing narrative doc end up describing the
same thing, the plan is to **replace** the narrative version with the
spec-adherent one, not maintain both. [Architecture](../architecture.md)
is the most likely candidate — once real specs exist, the parts of it
that are actually contracts (not narrative explanation for a
non-Cloudflare-savvy reader) should move there and be superseded, rather
than kept as a second, driftable copy. This isn't scheduled work yet —
it's the intended direction once there's an actual spec to migrate
toward, so we don't accidentally lock in "docs and specs coexist forever"
by default.

