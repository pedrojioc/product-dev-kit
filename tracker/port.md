# Tracker port

The issue tracker is a port. Skills name the operations below and never a backend tool.
The project's `docs/engineering/CONVENTIONS.md`, section `## Tracker`, picks the adapter:

| `Backend:` | Adapter to read |
|---|---|
| `files` (default) | `${CLAUDE_PLUGIN_ROOT}/tracker/files.md` |
| `linear` | `${CLAUDE_PLUGIN_ROOT}/tracker/linear.md` |

A CONVENTIONS.md written before this port has a `## Linear` section and no `## Tracker`:
treat it as `linear`. Read this file and the selected adapter once, before the first
operation. Never mix backends in one repository.

## Issue model
Every adapter stores the same fields. The body is `templates/requirement.md`, unchanged.

| Field | Values |
|---|---|
| `id` | `<PREFIX>-<n>`, prefix from CONVENTIONS.md |
| `title` | imperative, English |
| `type` | `feature`, `bug`, `improvement` (chores and refactors) |
| `module` | module name from `docs/product/` |
| `status` | `backlog` → `todo` → `in-progress` → `in-review` → `done` |
| `priority` | `1` urgent, `2` high, `3` medium, `4` low, `0` none (sorts last) |
| `estimate` | points, optional |
| `blocked_by` | list of issue IDs |
| `project` | optional grouping; never changes the prefix |
| `branch` | git branch for the issue |

There is no blocked status: a blocked issue stays `todo` with `blocked_by` and a log entry.

## Operations
| Operation | Returns | Used by |
|---|---|---|
| `create(issue)` | the new ID | req-create |
| `get(id)` | fields, body and the full log | implement, product-ask |
| `list(status, filter)` | IDs, titles, priority, `blocked_by`, ordered by priority | next |
| `transition(id, status)` | nothing | implement |
| `log(id, title, body)` | nothing; appends, never edits an entry | implement, product-ask |

## Rules
- Agents stop at `in-review`. `done` is always a human decision.
- A dependency counts as satisfied when its status is `in-review` or `done`.
- Log entries are English, at most 15 lines, and never carry a diff or a test log.
