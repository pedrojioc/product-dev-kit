# pdk — product-dev-kit

A Claude Code plugin that splits product work from implementation work, with Linear as the single queue.

Two responsibilities, kept apart on purpose:

- **WHAT** — a Product Manager that owns the product source of truth and writes self-contained requirements into Linear. It never writes code.
- **HOW** — a Tech Lead that reads one requirement by ID, designs the technical solution, splits it into task packets, delegates them to specialized subagents, verifies the result, and moves the issue through Linear.

The owner always decides. The PM proposes options with tradeoffs; it never invents a business rule. Agents stop at `In Review`: marking an issue `Done` and merging stay human decisions.

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
- A **Linear** workspace, one team per product. This one the plugin does ship, in `.mcp.json`, because it is pdk's own queue.

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

Then, in the project, run `/mcp` to authenticate `linear` and `/pdk:setup` to configure the repo.

## Per-project setup

Run `/pdk:setup` once in each repository. It inspects the repo for the stack and the test, lint and typecheck commands, reads your Linear teams, asks only what it could not detect, and writes `docs/engineering/CONVENTIONS.md`. Every skill reads that file, and without it the Tech Lead stops.

The configuration is deliberately a file in your repository rather than answers to an install dialog. A plugin's `userConfig` values are stored per user, and Claude Code [ignores project and local entries](https://code.claude.com/docs/en/settings-reference#pluginconfigs) for them, so one answer would apply to every repository you work in. A Linear team key belongs to one product, not to a person.

Linear: one team per product, because the issue ID prefix is the team identifier. Projects group issues inside a team but never change the prefix. `/pdk:setup` also reports whether that team has the five states and the three type labels pdk expects.

## Commands

| Command | Role | What it does |
|---|---|---|
| `/pdk:product-init` | PM | Interviews the owner one question at a time and writes `docs/product/` (index, modules, decisions log) |
| `/pdk:product-ask <question>` | PM | Answers from the product docs, or proposes options and waits for the owner to decide |
| `/pdk:req-create <need>` | PM | Splits a need into self-contained Linear issues, shown for approval before creation |
| `/pdk:setup` | — | Configures pdk for this repository: writes `docs/engineering/CONVENTIONS.md` and checks the Linear team |
| `/pdk:doctor` | — | Verifies the requirements of the current project and prints the fixes |
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

## Privacy

The plugin itself collects nothing and sends nothing anywhere. Two components talk to something outside your machine:

- **Linear**, through the MCP server this plugin ships. Everything the PM and the Tech Lead write — requirements, plans, comments — goes to your own Linear workspace, under [Linear's privacy policy](https://linear.app/privacy). You authenticate it yourself with `/mcp`.
- **Nothing else.** CodeGraph indexes and queries entirely on your machine, and `/pdk:doctor` only reads local files and your Claude Code settings.

## License

MIT. See [LICENSE](LICENSE).
