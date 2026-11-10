# pdk — product-dev-kit

A Claude Code plugin that splits product work from implementation work, with one issue queue: Markdown files in your repo by default, or Linear.

Two responsibilities, kept apart on purpose:

- **WHAT** — a Product Manager that owns the product source of truth and writes self-contained requirements into the issue tracker. It never writes code.
- **HOW** — a Tech Lead that reads one requirement by ID, designs the technical solution, splits it into task packets, delegates them to specialized subagents, verifies the result, and moves the issue through the tracker.

The owner always decides. The PM proposes options with tradeoffs; it never invents a business rule. Agents stop at `in-review`: marking an issue `done` and merging stay human decisions.

## Requirements

Run `/pdk:doctor` in a project to check all of them at once. It reports what is missing and the exact command that fixes it; it changes nothing.

- **CodeGraph** ([colbymchenry/codegraph](https://github.com/colbymchenry/codegraph)), configured once for your user and indexed per repository. It is a hard dependency, not an optimization: the Tech Lead and `pdk:explorer` answer structural questions from the index instead of sweeping the repo with grep, and that is where most of the token saving comes from.

  ```bash
  curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh
  claude mcp add codegraph --scope user -- codegraph serve --mcp   # once per machine
  cd /path/to/repo && codegraph init --index                       # once per checkout
  ```

  The plugin deliberately does **not** ship the codegraph server: a second copy would load a duplicate set of tool schemas into every session, which is the opposite of the point. pdk verifies the global one and stops if it is missing.

  The per-repo index you do not have to create yourself: a missing `.codegraph/` is the trigger to build it, so `/pdk:implement` runs `codegraph init --index` at preflight, guarded to a real git repository that is not `$HOME` or a temp directory. `pdk:explorer` has no shell, so it reports `Blocked` instead of falling back to grep, and the preflight runs before any delegation.
- An **issue tracker**, chosen per repository in `CONVENTIONS.md`:
  - `files` (default): one Markdown file per issue in `docs/work/<ID>.md`, versioned with the code. Nothing to install.
  - `linear`: a Linear workspace, one team per product. The plugin ships its MCP server in `.mcp.json`; authenticate it with `/mcp`.

  Both sit behind one port, `tracker/port.md`, so the skills never name a backend tool.

## Install

pdk is meant to be installed **per project**, so a repository that does not use this workflow does not pay for its context:

```bash
cd /path/to/repo
claude plugin install pdk --marketplace pedrojioc/product-dev-kit --scope local
```

`--scope local` writes to the repo's `.claude/settings.local.json`: yours only, and gitignored. Drop the flag to install it for every project on the machine (`--scope user`, the default).

To share it with a team, declare the marketplace at project scope first, then install:

```bash
claude plugin marketplace add pedrojioc/product-dev-kit --scope project
claude plugin install pdk@pdk --scope project
```

That commits both entries in `.claude/settings.json`. Note what the committed entry does and does not do: it turns the plugin on for your collaborators but [doesn't download it to their machines](https://code.claude.com/docs/en/plugins/install#choose-an-install-scope), so each of them still runs the install command once.

Then, in the project, run `/pdk:setup` to configure the repo (and `/mcp` to authenticate `linear` if you chose it).

## Per-project setup

Run `/pdk:setup` once in each repository. It inspects the repo for the stack and the test, lint and typecheck commands, asks which tracker to use (`files` unless you say otherwise), reads your Linear teams only if you chose Linear, asks only what it could not detect, and writes `docs/engineering/CONVENTIONS.md`. Every skill reads that file, and without it the Tech Lead stops.

It then offers one more thing and installs it only if you say yes: `tests/architecture.spec.ts`, described under [Conventions](#conventions). That is the only other file `/pdk:setup` writes, and it writes it nowhere else — it never edits code you already have.

The configuration is deliberately a file in your repository rather than answers to an install dialog. A plugin's `userConfig` values are stored per user, and Claude Code [ignores project and local entries](https://code.claude.com/docs/en/settings-reference#pluginconfigs) for them, so one answer would apply to every repository you work in. A tracker and its issue prefix belong to one product, not to a person.

With `files`, an issue's status travels on its own branch: `in-progress` and `in-review` reach the default branch with the merge, together with the code, and `/pdk:next` reads the status from the issue's branch when one exists. Issues are created only on the default branch, so two branches never hand out the same ID.

Linear: one team per product, because the issue ID prefix is the team identifier. Projects group issues inside a team but never change the prefix. `/pdk:setup` also reports whether that team has the five states and the three type labels pdk expects.

## Commands

| Command | Role | What it does |
|---|---|---|
| `/pdk:product-init` | PM | Interviews the owner one question at a time and writes `docs/product/` (index, modules, decisions log) |
| `/pdk:product-ask <question>` | PM | Answers from the product docs, or proposes options and waits for the owner to decide |
| `/pdk:req-create <need>` | PM | Splits a need into self-contained issues, shown for approval before creation |
| `/pdk:setup` | — | Configures pdk for this repository: writes `docs/engineering/CONVENTIONS.md`, offers the architecture guardrail, and checks the tracker |
| `/pdk:doctor` | — | Verifies the requirements of the current project and prints the fixes |
| `/pdk:next [filter]` | Tech Lead | Shows the next unblocked `todo` issue by priority and offers to implement it |
| `/pdk:implement <ID>` | Tech Lead | Gate, design, task packets, delegation, verification, tracker updates |

## Agents

| Agent | Model | Job |
|---|---|---|
| `pdk:explorer` | haiku | Read-only code mapper; returns a compact map, never file dumps |
| `pdk:implementer` | sonnet | Implements one task packet with strict TDD and commits it |
| `pdk:verifier` | sonnet | Read-only review of the diff against acceptance criteria and conventions; runs the full suite |

## How the context stays small

Context is packaged once and reused, instead of being re-read by every worker:

- The PM copies the business rules and glossary into each issue, so it is implementable on its own.
- The Tech Lead writes one task packet per work unit and *selects* the rules instead of copying them: the packet carries absolute paths to the conventions and the layer references that unit must obey, and the implementer reads them before its first test. So each worker loads only the layers its own unit touches, and editing a reference changes the next unit's output. An implementer never reads the issue or the product docs.
- Structural questions go through the CodeGraph index, never through a grep sweep: one indexed query replaces dozens of reads.
- Subagents answer in fixed, capped formats and start without the user's global `CLAUDE.md`.
- Models match the work: the Tech Lead thinks, the workers execute.
- `skills/engineering-conventions/` is an index; each reference loads only when it is needed.

## Conventions

`skills/engineering-conventions/` holds the generic rules, one reference each: hexagonal layering, domain design, use cases, the layer-to-layer data flow, SOLID, testing, NestJS wiring, git workflow, the doubt protocol, and the task packet format.

Three of them are design-time reading for the Tech Lead alone and never travel in a packet, because they answer questions a worker does not get to decide: which pattern a situation calls for, what units a module is cut into and in what order, and which rules carry an outside authority as against which are pdk's own to change freely.

A project's own `docs/engineering/CONVENTIONS.md` overrides all of it. Tests live in a top-level `tests/` folder that mirrors the source tree exactly, one spec per production file, never next to the code.

### The architecture guardrail

Six of those rules can be broken silently, and no amount of prose catches them in review. `/pdk:setup` offers to install `tests/architecture.spec.ts`, which walks the import graph and fails on:

- a context importing another context
- `src/shared/` importing any context, which would make the neutral ground not neutral
- `domain/` or `application/` importing a framework, ORM, HTTP client or `process.env`
- the core importing `infrastructure/` or `interface/`
- a module reaching into a sibling module's `domain/` directly
- a spec living under `src/`

It has no dependencies and no test-runner lock-in, so it runs inside whatever suite the project already has. `pdk:verifier` treats a failure there as a blocker naming the violated rule rather than a flaky test, and `/pdk:doctor` warns when a project has no such spec, since the dependency rule is then unenforced.

## Privacy

The plugin itself collects nothing and sends nothing anywhere. Two components talk to something outside your machine:

- **Linear**, only if you choose it as the tracker, through the MCP server this plugin ships. Everything the PM and the Tech Lead write — requirements, plans, comments — goes to your own Linear workspace, under [Linear's privacy policy](https://linear.app/privacy). You authenticate it yourself with `/mcp`.
- **Nothing else.** CodeGraph indexes and queries entirely on your machine, and `/pdk:doctor` only reads local files and your Claude Code settings.

## License

MIT. See [LICENSE](LICENSE).
