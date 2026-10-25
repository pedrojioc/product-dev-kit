# pdk — product-dev-kit

A Claude Code plugin that splits product work from implementation work, with Linear as the single queue.

Two responsibilities, kept apart on purpose:

- **WHAT** — a Product Manager that owns the product source of truth and writes self-contained requirements into Linear. It never writes code.
- **HOW** — a Tech Lead that reads one requirement by ID, designs the technical solution, splits it into task packets, delegates them to specialized subagents, verifies the result, and moves the issue through Linear.

The owner always decides. The PM proposes options with tradeoffs; it never invents a business rule. Agents stop at `In Review`: marking an issue `Done` and merging stay human decisions.

## Requirements

- **CodeGraph**, installed and indexed in every repository that uses pdk. It is a hard dependency, not an optimization: the Tech Lead and `pdk:explorer` answer structural questions from the index instead of sweeping the repo with grep, and that is where most of the token saving comes from. The plugin ships the server in `.mcp.json`; the `codegraph` binary must be on `PATH`, and the repo needs its own `.codegraph/` index:

  ```bash
  cd /path/to/repo && codegraph init
  ```

  Without an index the Tech Lead stops at preflight and `pdk:explorer` reports `Blocked` rather than falling back to grep.
- A **Linear** workspace, one team per product. The plugin ships the Linear MCP server too.

## Install

pdk is meant to be installed **per project**, so a repository that does not use this workflow does not pay for its context:

```bash
cd /path/to/repo
claude plugin marketplace add /path/to/product-dev-kit --scope local
claude plugin install pdk@pdk-local --scope local
```

`--scope local` writes to the repo's `.claude/settings.local.json` (personal, gitignored). Use `--scope project` instead to commit the choice in `.claude/settings.json` and share it with the team; in that case the marketplace must be a git URL, because a local path only resolves on one machine. Drop the flag to install for every project at once (`--scope user`, the default).

Then run `/mcp` in that project and authenticate `linear`.

## Per-project setup

Each repository needs `docs/engineering/CONVENTIONS.md`, copied from `templates/CONVENTIONS.md`. It declares the stack, the test, lint and typecheck commands, the folder structure, and the Linear team key. Without it the Tech Lead skills stop.

Linear: one team per product, because the issue ID prefix is the team identifier. Projects group issues inside a team but never change the prefix.

## Commands

| Command | Role | What it does |
|---|---|---|
| `/pdk:product-init` | PM | Interviews the owner one question at a time and writes `docs/product/` (index, modules, decisions log) |
| `/pdk:product-ask <question>` | PM | Answers from the product docs, or proposes options and waits for the owner to decide |
| `/pdk:req-create <need>` | PM | Splits a need into self-contained Linear issues, shown for approval before creation |
| `/pdk:next [filter]` | Tech Lead | Shows the next unblocked `Todo` issue by priority and offers to implement it |
| `/pdk:implement <ID>` | Tech Lead | Gate, design, task packets, delegation, verification, Linear updates |

## Agents

| Agent | Model | Job |
|---|---|---|
| `pdk:explorer` | haiku | Read-only code mapper; returns a compact map, never file dumps |
| `pdk:implementer` | sonnet | Implements one task packet with strict TDD and commits it |
| `pdk:verifier` | sonnet | Read-only review of the diff against acceptance criteria and conventions; runs the full suite |

## How the context stays small

Context is packaged once and reused, instead of being re-read by every worker:

- The PM copies the business rules and glossary into each issue, so it is implementable on its own.
- The Tech Lead writes one task packet per work unit with only the conventions lines that unit needs. An implementer never reads the issue or the product docs.
- Structural questions go through the CodeGraph index, never through a grep sweep: one indexed query replaces dozens of reads.
- Subagents answer in fixed, capped formats and start without the user's global `CLAUDE.md`.
- Models match the work: the Tech Lead thinks, the workers execute.
- `skills/engineering-conventions/` is an index; each reference loads only when it is needed.

## Conventions

`skills/engineering-conventions/` holds the generic rules: hexagonal layering, domain design, use cases, the layer-to-layer data flow, SOLID, testing, NestJS wiring, git workflow, the doubt protocol, and the task packet format. A project's own `CONVENTIONS.md` overrides them.

Tests live in a top-level `tests/` folder that mirrors the source tree exactly, one spec per production file, never next to the code.
