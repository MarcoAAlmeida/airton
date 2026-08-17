# Spec strategy

Two kinds of specs, kept in different places:

- **Contracts** — interfaces between independently-deployed components
  (`apps/web` ↔ `apps/api`, soon `apps/web` ↔ scraper orchestration).
  Root-owned, in `.spec/contracts.md`: a breaking change to one of these
  is proposed there first, before either side changes.
- **Local specs** — a sub-project's own internal domain logic (how the
  scraper retries, how it parses a page). These live as a nested
  `openspec/` root inside that sub-project, once it exists as real code.
  OpenSpec's root resolution walks up from the working directory and
  uses the nearest `openspec/` folder, so a sub-project's local root
  takes precedence automatically when working inside it — confirmed by
  reading the tool's source
  ([github.com/Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)),
  not assumed.

## OpenSpec

[OpenSpec](https://openspec.dev/) is a spec-driven development
framework: `specs/` hold current requirements per capability, `changes/`
hold proposals reviewed before implementation. We installed the CLI
(`@fission-ai/openspec`) at the repo root for Activity 01 —
`/opsx:explore`, `/opsx:propose`, `/opsx:apply`, `/opsx:archive` are
available as Claude Code slash commands. `openspec/config.yaml`'s
`context:` field points at `AGENTS.md`, `.spec/contracts.md`, and
`docs/content/roadmap/` instead of duplicating them.

## Status

- `.spec/contracts.md` documents `apps/web` ↔ `apps/api`, with a
  placeholder for `apps/web` ↔ scraper — to be filled in before Activity
  01 phase 2 is implemented, not after.
- OpenSpec CLI installed and initialized at the repo root.
- Not started: local specs per sub-project (wait for real code);
  splitting `.spec/contracts.md` into `.spec/contracts/` — one file per
  relationship — once a second real contract exists there.
