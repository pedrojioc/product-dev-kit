---
name: setup
description: Configure pdk for this project: interview the owner, write docs/engineering/CONVENTIONS.md, and verify the Linear team.
disable-model-invocation: true
model: sonnet
effort: medium
---

You configure pdk for one repository. Reply to the owner in their language; write the file in English.

If the Linear tools are not callable, load them first with ToolSearch (query "linear").

## Process
1. Detect before asking. Never ask the owner what the repo can answer:
   - Stack and test runner: `package.json`, `pyproject.toml`, `go.mod`, `composer.json` or the equivalent.
   - Commands: the `test`, `lint` and `typecheck` scripts actually declared there.
   - Structure: the top two levels of the source tree, and whether tests already live in a mirrored `tests/` folder.
   - Linear: call `list_teams`; for the team the owner picks, call `list_issue_statuses` and `list_issue_labels`.
2. Ask only what is left, ONE question at a time, each carrying your detected value as the proposal. Stop and wait after each one. The minimum set is: Linear workspace name, team, Linear project (optional), plus anything detection could not resolve.
3. Write `docs/engineering/CONVENTIONS.md` from `${CLAUDE_PLUGIN_ROOT}/templates/CONVENTIONS.md`, replacing every `{placeholder}`. Leave none behind.
4. Offer the architecture guardrail, as ONE question. The rules in `hexagonal.md` that no prompt can enforce (no cross-context import, `shared/` independent of every context, the core free of frameworks and of adapter layers, no spec under `src/`) are only real if a test fails on them. On a yes, copy `${CLAUDE_PLUGIN_ROOT}/templates/architecture.spec.ts` to `tests/architecture.spec.ts` and adjust its `SRC` constant when the source root is not `src/`. On a no, say plainly that those rules stay unchecked, and move on.
5. Report what the Linear team is missing, without changing anything:
   - The five states `Backlog`, `Todo`, `In Progress`, `In Review`, `Done`. Name any that is absent or spelled differently.
   - The labels `Feature`, `Bug`, `Improvement`. Ask before creating one.
6. Finish by running `"${CLAUDE_PLUGIN_ROOT}/scripts/doctor.sh" "${CLAUDE_PROJECT_DIR}"` and print its output verbatim.

## Rules
- You write `docs/engineering/CONVENTIONS.md`, plus `tests/architecture.spec.ts` only when the owner says yes in step 4. Nothing else, and you edit no existing code.
- If that file already exists, show the changes you would make and wait for approval before overwriting it.
- Never invent a command. One you could not detect and the owner did not give stays as an explicit `TODO:` line.
- The conventions this plugin ships (hexagonal layering, mirrored tests) are the default. If this repo does something else, record what the repo actually does: that file overrides the plugin.
