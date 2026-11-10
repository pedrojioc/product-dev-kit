# Tracker adapter: Linear

Issues live in Linear, through the `linear` MCP server this plugin ships in `.mcp.json`. If
its tools are not callable, load them with ToolSearch (query "linear").

## Mapping
| Port | Linear |
|---|---|
| prefix | team identifier (Team settings > General > Identifier), one team per product |
| `status` | states `Backlog`, `Todo`, `In Progress`, `In Review`, `Done` |
| `type` | label `Feature`, `Bug` or `Improvement` |
| `module` | label `module:<name>`; if it does not exist, tell the owner before creating it |
| `priority`, `estimate` | the issue's own fields, same scale |
| `blocked_by` | "blocked by" relations |
| `project` | Linear project from CONVENTIONS.md; projects never change the prefix |
| `branch` | the issue's `gitBranchName`, verbatim |
| log entry | a comment on the issue |

## Operations
- `create`: `save_issue` with team, project, labels, priority, estimate and state; then the
  "blocked by" relations.
- `get`: the issue plus its comments.
- `list`: `list_issues` for the team (and project), state `Todo`, ordered by priority.
- `transition`: update the state. Moving to `In Progress` also assigns the issue to the owner.
- `log`: a comment whose first line is the entry title.

## Rules
- Status changes are visible at once; nothing about the issue is committed to git.
- `/pdk:setup` reports missing states and type labels and asks before creating any.
