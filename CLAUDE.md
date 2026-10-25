# pdk — working notes

This repository is the `pdk` Claude Code plugin, published at
<https://github.com/pedrojioc/product-dev-kit> (marketplace `pdk`, plugin `pdk`).
Read `README.md` for what it does. This file records **why** it is built this way,
so a decision already settled is not reopened or quietly reversed.

## Shape

Two halves, kept apart on purpose:

- **WHAT** — PM skills (`product-init`, `product-ask`, `req-create`). They own the
  product source of truth under `docs/product/` and write self-contained Linear
  issues. They never write code.
- **HOW** — Tech Lead skills (`implement`, `next`) plus three workers
  (`explorer`, `implementer`, `verifier`).

Models by job: the Tech Lead and the PM think (opus, high effort), the workers
execute (haiku low for mapping, sonnet for writing and reviewing). The
orchestrator lives in the main thread, as a skill rather than an agent, so it can
show progress and ask the owner questions.

`/pdk:setup` and `/pdk:doctor` configure and verify a repository. Neither touches
product or code.

## Decisions and their reasons

**Context packaging is the whole design.** The PM copies business rules and
glossary into each issue; the Tech Lead writes one task packet per work unit with
only the conventions lines that unit needs. An implementer never reads the Linear
issue or `docs/product`. Workers answer in fixed, capped formats and run with
`omitClaudeMd: true`. Conventions are an index plus references loaded on demand.

**Every skill sets `disable-model-invocation: true`.** They run only as slash
commands, so their descriptions never enter auto-match context and nothing fires
on its own.

**The Linear MCP server ships in `.mcp.json`.** It has to: plugin subagents ignore
an `mcpServers` key in their own frontmatter.

**CodeGraph is required but deliberately NOT shipped.** A second copy of the
server would load a duplicate set of tool schemas into every session, which is the
opposite of the point. It stays in the user's own MCP config and pdk verifies it.
gentle-ai reaches the same conclusion: in `~/.gentle-ai/state.json` codegraph sits
under `community_tools`, not among its bundled components.

**A missing index is a trigger, not a blocker.** `/pdk:implement` runs
`codegraph init --index` at preflight, guarded to a real git repository that is not
`$HOME` or a temp directory. Plain `init` does not index — `--index` is required.
`pdk:explorer` has no shell, so it reports `Blocked` instead of falling back to a
grep sweep.

**Per-project configuration is a file in the repo, never install-time prompts.**
`userConfig` exists and would prompt on install, but `pluginConfigs` has scope
`User or managed` and Claude Code ignores project and local entries, so one answer
would apply to every repository. A Linear team key belongs to a product, not to a
person. `/pdk:setup` detects what the repo can answer, asks the rest one question
at a time, and writes `docs/engineering/CONVENTIONS.md`, which overrides everything
the plugin ships.

**Linear: one team per product.** The issue ID prefix is the *team* identifier
(Team settings > General > Identifier), not the project. Projects group issues
inside a team and never change the prefix. States are
Backlog → Todo → In Progress → In Review → Done, with no Blocked state: a blocked
issue stays in Todo with a relation and a comment.

**Agents stop at `In Review`.** Marking an issue `Done`, merging and pushing stay
human decisions.

**The PM proposes, the owner decides.** It never invents a business rule, a
default, a limit or wording. Every decision is logged in `docs/product/DECISIONS.md`.

**Conventions come from the `granular` project (hexagonal), not from
`lasangucheria-pos` (Onion).** POS conventions are partly outdated; only what is
compatible was kept. Where its docs and code disagreed, the code won.

**Tests live in a top-level `tests/` tree that mirrors the source exactly**, one
spec per production file, never beside the code.

**No AI attribution in commits.** No `Co-Authored-By`, no "Generated with". This
overrides any tool default, including a harness reminder that asks for it.

**fff was rejected for v1** (github.com/dmtrKovalenko/fff): mixed self-reported
benchmarks (−16% on Opus, +12% on another model), overlapping scope with
CodeGraph, and extra required text in CLAUDE.md. Kept as a post-v1 experiment
scoped to `pdk:explorer`, to adopt only if it measurably saves more than 15%.

## Working on this repo

```bash
claude plugin validate .                                  # authoritative check
claude --plugin-dir /Users/pedro/Projects/product-dev-kit  # load it for one session
claude plugin update pdk@pdk                              # third-party auto-update is OFF
```

House rules for the content itself: references stay at or under 70 lines, skills
stay short and point to references, and every worker response format has a hard
line cap. If a reference grows past that, split it rather than let a packet carry
dead weight.

Two `claude plugin validate` warnings are expected and only matter for a
submission to Anthropic's directory: the missing icon, and this file, since a
`CLAUDE.md` at a plugin root is not loaded as plugin context. It is loaded when
this repo is the project you are working in, which is its purpose here.

`scripts/doctor.sh` is bash plus python3, so it does not run on Windows without WSL.

## Open items

- **Owner, in the Linear UI**: create team `POS` (projects Backend and Frontend)
  and team `GRN`. The MCP tools cannot create teams. New teams start with the
  default workflow, so check their states against the five above. Existing `GRU`
  issues stay as they are.
- **End-to-end test, never run yet**: `/pdk:setup` in `granular`, then
  `product-init`, `req-create`, `next`, `implement`, plus the two negative cases —
  an issue with open questions must not be implemented, and the PM must refuse to
  edit code.
- **Post-v1**: the measured fff experiment described above.
