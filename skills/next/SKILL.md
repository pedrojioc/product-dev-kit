---
name: next
description: Show the next Linear issue to work on (highest priority, unblocked, in Todo) and offer to implement it.
disable-model-invocation: true
model: opus
effort: medium
arguments: filter
---

Reply to the owner in their language.

Optional filter: $ARGUMENTS (a project name or a label). Empty means no extra filter.

If the Linear tools are not callable, load them first with ToolSearch (query "linear").

## Process
1. Read the Linear section of the project's `docs/engineering/CONVENTIONS.md` for the team key and project. If it is missing, stop and tell the owner.
2. List issues in that team (and project if set) with state `Todo`, ordered by priority, applying the filter.
3. Drop issues that have a "blocked by" issue not in `In Review` or `Done`.
4. Show the first one, max 8 lines: ID, title, priority, module, number of acceptance scenarios, dependencies. Add one line with the next two candidates (ID and title).
5. Ask: implement it? Then STOP and wait.
6. On yes, read `${CLAUDE_PLUGIN_ROOT}/skills/implement/SKILL.md` and follow it with that issue ID.

## Rules
- Do not change any state or assignment here.
- If nothing is eligible, say so and name the reason (empty Todo, or all blocked).
