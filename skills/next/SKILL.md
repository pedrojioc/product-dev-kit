---
name: next
description: Show the next issue to work on (highest priority, unblocked, in todo) and offer to implement it.
disable-model-invocation: true
model: opus
effort: medium
arguments: filter
---

Reply to the owner in their language.

Optional filter: $ARGUMENTS (a project name or a module). Empty means no extra filter.

## Process
1. Read the `## Tracker` section of the project's `docs/engineering/CONVENTIONS.md`. If the file is missing, stop and tell the owner to run `/pdk:setup`. Then read `${CLAUDE_PLUGIN_ROOT}/tracker/port.md` and the adapter it selects.
2. `list` issues with status `todo`, ordered by priority, applying the filter.
3. Drop issues with a `blocked_by` issue whose status is not `in-review` or `done`.
4. Show the first one, max 8 lines: ID, title, priority, module, number of acceptance scenarios, dependencies. Add one line with the next two candidates (ID and title).
5. Ask: implement it? Then STOP and wait.
6. On yes, read `${CLAUDE_PLUGIN_ROOT}/skills/implement/SKILL.md` and follow it with that issue ID.

## Rules
- Do not change any status, assignment or file here.
- If nothing is eligible, say so and name the reason (empty todo, or all blocked).
