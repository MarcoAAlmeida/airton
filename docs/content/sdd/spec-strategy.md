# Spec strategy: contracts, and OpenSpec for Activity 01

Where this came from: [OpenSpec](https://openspec.dev/), a spec-driven
development framework — specs are living requirement docs per capability,
and `changes/` hold proposals (proposal, design, tasks, spec deltas)
reviewed before implementation.

**Correction, checked against the tool's actual source:** an earlier
version of this page said nested `openspec/` roots per sub-project were
just "a third party's adaptation of OpenSpec's concepts... not something
the tool prescribes out of the box." That doubt wasn't warranted, and the
original plan — a root spec layer for contracts plus a local spec layer
per sub-project — was right about how the tool actually behaves, not just
a plausible-sounding idea. The public docs don't spell out monorepo
usage, but `src/core/root-selection.ts` and `src/core/planning-home.ts`
(read directly from [github.com/Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec))
confirm it: root resolution walks up from the current working directory
and returns the **nearest** ancestor containing a qualifying `openspec/`
folder. A code comment there explains this is deliberate — without it, a
directory like `~/openspec/<id>` would become a "phantom root" capturing
every command run anywhere under `$HOME`. A sub-project's own
`openspec/` genuinely does take precedence over the repo root's when you
work from inside it. This is real, intentional, built-in behavior, not
an unofficial adaptation.

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

## Why we changed our mind about the CLI

The original reasoning for deferring the CLI conflated two different
things it provides: contract-boundary enforcement between sub-projects
(legitimately not needed until a second one exists — see the correction
above, since that premise turned out to be wrong too) and a **persisted,
reviewable plan** written before implementation, protecting against an
agent misinterpreting a requirement. The second one doesn't need a
second sub-project at all — it needs requirements ambiguous enough that
the interpretation is worth checking, which is exactly where Activity 01
starts (choice of Source, event shapes, RAG design, Agent framework — all
have more than one reasonable reading). Plan Mode gives that review gate
*in-session*, but the plan itself doesn't persist anywhere durable,
shareable with teammates, or browsable months later — which is what
actually mattered. That's the gap the CLI closes, so we installed it.

**Installed**: `@fission-ai/openspec` globally, initialized at the repo
root via `openspec init --tools claude` (no scraper sub-project folder
exists yet for it to live under instead). This added `/opsx:explore`,
`/opsx:propose`, `/opsx:apply`, and `/opsx:archive` slash commands and
skills for Claude Code, plus `openspec/config.yaml`, whose `context:`
field points at `AGENTS.md`, `.spec/contracts.md`, and
`docs/content/roadmap/` rather than duplicating them.

Local specs per sub-project's *internal* domain logic still wait on that
sub-project existing as real code — that reasoning is unchanged.

Specs and OpenSpec's own `changes/`/`specs/` artifacts live in
`openspec/` and `.spec/` at the repo root — **not** under `docs/content/`,
which stays human-facing narrative (architecture description, roadmap,
decisions like this one).

## Status — this is the register of intent

- **Done:** `.spec/contracts.md` exists at the repo root, documenting the
  current `apps/web` ↔ `apps/api` contract. OpenSpec CLI installed and
  initialized at the repo root for Activity 01.
- **Next (not started):** draft the first real proposal via
  `/opsx:propose` for Activity 01 phase 1 (the first scraper). Before
  Activity 01 phase 2 (the scraper's BFF endpoints) is implemented, add
  the `apps/web` ↔ scraper orchestration contract to `.spec/contracts.md`
  — the shared event shapes (`scrape.requested` / `page.scraped` /
  `scrape.completed` / `scrape.failed`) and `scrape_id` semantics
  designed in conversation — before the endpoints exist, not after.
- **Later (not started):** local specs per sub-project's internal domain
  logic, as a nested `openspec/` root inside that sub-project (confirmed
  to work as intended, not a guess) — once that sub-project exists as
  real code. Only the timing is deferred, not whether this is the right
  mechanism.

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

