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

## Correction: the root contract boundary already exists

An earlier version of this page said local specs and the root contract
file should wait until a second sub-project existed. That was wrong —
`apps/web` and `apps/api` are already two independently-deployed
components with a real contract between them today (the `/api/chat`
request/response shape, the shared-secret auth header), and the *next*
piece of work (Activity 01 phase 2, the scraper's BFF endpoints) is
itself a new contract between `apps/web` and scraper orchestration. There
was never a point where "no boundary exists yet" was actually true — that
was an arbitrary exclusion of the existing web/api relationship, not a
real state of the repo. `.spec/contracts.md` now exists at the repo root
and documents the current `apps/web` ↔ `apps/api` contract; the
`apps/web` ↔ scraper contract gets filled in there before phase 2's
endpoints are implemented, not after.

## Why not the CLI yet

Local specs per sub-project's *internal* domain logic (as opposed to the
root contract layer above) still wait on that sub-project existing as
real code — writing one for the scraper before it exists would mean
documenting structure that doesn't exist yet, the same failure mode we
already flagged for `AGENTS.md`.

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

- **Done:** `.spec/contracts.md` exists at the repo root, documenting the
  current `apps/web` ↔ `apps/api` contract.
- **Next (not started):** before Activity 01 phase 2 (the scraper's BFF
  endpoints) is implemented, add the `apps/web` ↔ scraper orchestration
  contract to `.spec/contracts.md` — the shared event shapes
  (`scrape.requested` / `page.scraped` / `scrape.completed` /
  `scrape.failed`) and `scrape_id` semantics designed in conversation,
  pinned down before the endpoints exist, not after.
- **Later (not started):** local specs per sub-project's internal domain
  logic, once each one exists as real code. Full OpenSpec CLI adoption
  (proposals, deltas, review workflow) only if and when the ceremony
  itself — not just the contract boundary — earns its cost. Separately:
  whether/how to persist *plans* (not contracts) as durable, git-tracked,
  team-shareable records is still an open discussion, not yet resolved.

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

