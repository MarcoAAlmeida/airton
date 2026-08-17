# The `AGENTS.md` / `CLAUDE.md` strategy

Before adding these files, we read three sources and found a real
disagreement worth resolving deliberately rather than guessing:

- [AGENTS.md Best Practices for AI Coding Assistants](https://gist.github.com/0xfauzi/7c8f65572930a21efa62623557d83f6e)
  argues for a fairly complete reference file — environment setup, build
  and test commands, code style, project structure, permission
  boundaries — capped around 150 lines, with nested files per
  subdirectory in a monorepo.
- [Writing Good Agents](https://www.philschmid.de/writing-good-agents)
  argues the opposite, backed by measurements: auto-generated or
  over-detailed files reduce success rates by roughly 3% while raising
  cost by 20%+, because agents *do* follow unnecessary instructions,
  burning 14–22% more reasoning tokens on things that didn't need doing.
  Recommends under 300 lines, ideally under 60.
- [A Complete Guide to AGENTS.md](https://www.aihero.dev/a-complete-guide-to-agents-md)
  frames it as a hard budget: frontier models reliably follow only
  ~150–200 instructions total, and every line in `AGENTS.md` competes for
  that budget on *every* turn, whether relevant or not. Recommends a
  near-minimal root file, with anything specialized pushed into files an
  agent reads only when relevant ("progressive disclosure").

We sided with the minimalist sources (2 and 3) — they cite measured
effects, not just structural opinion, and independently agree with each
other. What we actually adopted:

- **Root `AGENTS.md` stays generic.** It states what this discovery
  project is, that its scope is expected to evolve, and that it's a
  monorepo of independent sub-projects — then points to
  [Architecture](../architecture.md) and [Roadmap](../roadmap/index.md)
  for anything deeper, rather than duplicating them inline.
- **Each sub-project gets its own scoped file** (`apps/web/AGENTS.md`,
  `apps/api/AGENTS.md`), covering only what's non-obvious and specific to
  that folder — a build-output gotcha, an auth model shape, a dependency
  constraint — not a restated tech-stack summary a linter or
  `package.json` already makes obvious. This also has a concrete
  technical reason beyond style: if a sub-folder is opened as its own
  project root, only *that* folder's file is in view, so it needs to
  stand on its own.
- **`CLAUDE.md` is a one-line pointer to `AGENTS.md`**, not a duplicate
  file. The original idea was a symlink (`AGENTS.md` as source of truth,
  `CLAUDE.md` symlinked to it), but this machine can't create symlinks
  without administrator rights, and a real symlink would be fragile
  across the Windows-to-Linux boundary this repo already crosses (local
  dev on Windows, Cloudflare's build runners on Linux). A pointer file
  gets the same practical result — one source of truth, nothing to drift
  out of sync — without that fragility.
- All six files currently in the repo are under 30 lines each, well
  inside every source's recommended ceiling.
