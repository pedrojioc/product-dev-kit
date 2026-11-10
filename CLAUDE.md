# pdk — working notes

This repository is the `pdk` Claude Code plugin, published at
<https://github.com/pedrojioc/product-dev-kit> (marketplace `pdk`, plugin `pdk`).
Read `README.md` for what it does. This file records **why** it is built this way,
so a decision already settled is not reopened or quietly reversed.

## Shape

Two halves, kept apart on purpose:

- **WHAT** — PM skills (`product-init`, `product-ask`, `req-create`). They own the
  product source of truth under `docs/product/` and write self-contained
  issues into the tracker. They never write code.
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
glossary into each issue. The Tech Lead writes one task packet per work unit, but it
*selects* rules instead of transcribing them: the packet's `Required reading` carries
absolute paths (project `CONVENTIONS.md`, the references for the layers that unit
touches, the nearest file to mirror) and the implementer reads them before its first
test. An implementer never reads the issue or `docs/product` — product context
stays packaged, architecture rules do not. Workers answer in fixed, capped formats and
run with `omitClaudeMd: true`. Conventions are an index plus references loaded on demand.

**Architecture rules reach the implementer by path, not by transcription.** Copying
them by hand made the Tech Lead (opus, high) a photocopier, silently lost whatever it
failed to predict at design time, and left the references inert: editing
`domain-design.md` changed no generated code. The test that settles it is "if I edit a
reference, does tomorrow's code change?" — now yes, for every packet of that layer. The
risk this opens, a worker that feels entitled to decide because it can see the whole
architecture, is held by one rule repeated in the packet and in `implementer.md`: the
references say HOW to write what the packet names, never what to add. Rejected
alternative: one implementer per layer. The process is identical across layers
(red-green-refactor, allowed files, one commit, one response format) and only the rules
differ — different knowledge is a file, not an agent. It would also force single-layer
packets, and real units span layers (a use case plus the VO it builds).

The same split governs `references/decision-gates.md`: WHICH pattern to reach for (Criteria
vs a repository lookup, a policy vs an `if` chain, a query service vs the repository, a
subscriber vs a second save) is a design decision, so the gates are Tech Lead reading at
design time and never travel in a packet. The references are cut by topic, not by layer, so
no single file is "the application layer"; `SKILL.md` carries a per-layer table naming the
complete set, and `hexagonal.md` ships in every packet because all four layers need its
layout, dependency and port rules. `references/module-blueprint.md` is the same kind of
Tech-Lead-only reading for the other design question: WHAT units a module is cut into and in
what order.

**Three formats were borrowed from the `hexagonal-architect` lab repo**
(`~/Projects/Lab/hexagonal-architect`): gate tables, per-layer output contracts, and a
rationale that separates sourced rules from our own. Its RULES were not imported, and four of
them contradict pdk deliberately: Nest decorators on core classes (the lab allows
`@Injectable()` there, pdk forbids every `@nestjs/*` import in the core and registers use
cases with `useFactory` so they never need one, which keeps the rule enforceable by grep),
who throws `NotFoundException`, VO file placement, and whether a cross-context mechanism is
needed at all. `references/rationale.md` records which rules carry an authority (Cockburn,
Evans, Vernon, Fowler, MS Learn, the NestJS docs) and which are ours to change freely; the
citations live verified in the lab repo and are reproduced, not re-verified, here.

**Mechanical guardrails beat prose.** Six rules a worker can break silently (no
cross-context import, `shared/` independent of every context, the core free of frameworks
and of adapter layers, no sibling module's `domain/` imported directly, no spec under
`src/`) ship as `templates/architecture.spec.ts`: dependency-free, no runner lock-in,
verified against a fixture carrying one planted violation per rule plus a clean tree that
must pass. `/pdk:setup` offers it as one question and installs it only on a yes, because it
is code in the owner's repo; `/pdk:doctor` warns when no `tests/architecture.spec.ts`
exists; `pdk:verifier` treats a failure there as a blocker naming the broken rule, never a
flaky test. This is the only file besides `CONVENTIONS.md` that `/pdk:setup` writes.

**Every skill sets `disable-model-invocation: true`.** They run only as slash
commands, so their descriptions never enter auto-match context and nothing fires
on its own.

**The tracker is a port; Markdown files are the default, Linear an adapter.**
`tracker/port.md` names five operations (create, get, list, transition, log) and one
issue model; `tracker/files.md` and `tracker/linear.md` implement them, and
`CONVENTIONS.md` (`## Tracker`, `Backend:`) picks one. A file written before the port,
with a `## Linear` section, counts as `linear`. SQLite was rejected as the default: it
needs an MCP server (schemas in every session, the reason CodeGraph is not shipped) or
the `sqlite3` CLI (absent on Windows), and a binary `.db` cannot be reviewed or merged.
With `files`, the issue file travels on the issue's branch, so status reaches the
default branch with the code; the *effective status* is read from the issue's branch
when it exists, which keeps `next` from offering work already started. Issues are
created only on the default branch, so IDs (highest + 1) never collide.

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
would apply to every repository. A tracker and its issue prefix belong to a product,
not to a person. `/pdk:setup` detects what the repo can answer, asks the rest one question
at a time, and writes `docs/engineering/CONVENTIONS.md`, which overrides everything
the plugin ships.

**Linear (when chosen): one team per product.** The issue ID prefix is the *team* identifier
(Team settings > General > Identifier), not the project. Projects group issues
inside a team and never change the prefix. States are
Backlog → Todo → In Progress → In Review → Done, with no Blocked state: a blocked
issue stays in Todo with a relation and a comment.

**Agents stop at `in-review`.** Marking an issue `done`, merging and pushing stay
human decisions.

**The PM proposes, the owner decides.** It never invents a business rule, a
default, a limit or wording. Every decision is logged in `docs/product/DECISIONS.md`.

**Adopting an existing project reads its Markdown, never its code.**
`product-init` with existing docs (`references/adoption.md`) turns them into candidates
cited by `path:line`, and the owner confirms each module before anything is written.
Code is excluded on purpose: it says what the system does, not what it should do, so
deriving rules from it would promote bugs to business rules. Pending requirements found
in the sources are listed for `req-create`, never turned into issues directly, and the
sources are never edited or deleted.

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
claude plugin eval . --scaffold --allow-tools Write,Edit,Bash   # billed model runs
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
  `product-init`, `req-create`, `next`, `implement`. This stays manual: the whole
  flow needs Linear, codegraph and a real repo, which is an integration test, not
  an eval.
- **`evals/` covers only what runs without Linear**: the PM refusing to write code,
  `product-ask` refusing to invent an undocumented rule, and `doctor` reporting
  without repairing. Each case carries its own `files/` fixture and `place-files.sh`,
  in the layout `claude plugin eval` reads. Never run yet — they are billed model
  runs, so the owner decides when.
- **`evals-linear/` is the opt-in group**: the `implement` gate refusing an issue with
  open questions, which needs the real Linear MCP server. It lives in its own eval dir
  because a tag does not exclude a case — `--tag` filters, and a run without it takes
  every case in the dir — while `claude plugin eval .` reads `evals/` only. Its cases
  are also tagged `linear`, and `evals-linear/README.md` carries the one-time Linear
  fixture (team `HEX`, issue `HEX-7`) plus the command. Never run yet.
- **Post-v1**: the measured fff experiment described above.
