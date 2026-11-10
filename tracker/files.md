# Tracker adapter: files

One Markdown file per issue at `docs/work/<ID>.md`, versioned with the code. Use Read, Grep,
Glob, Edit, Write and git; there is no server to call.

## File
```markdown
---
id: GRN-12
title: Register a product with a price
type: feature
module: catalog
status: todo
priority: 2
estimate: 3
blocked_by: [GRN-10]
project: Backend
branch: grn-12-register-product-with-price
---

{body of templates/requirement.md}

## Log
### 2026-11-09 · implement · plan
- ...
```
One field per frontmatter line, so a grep can read it. `branch` is the lowercase ID plus a
kebab slug of the title, at most 50 characters. `blocked_by: []` when there is none.

## Where status lives
The issue file travels on the issue's branch: `in-progress` and `in-review` reach the default
branch with the merge, together with the code. So the **effective status** of an issue is the
`status:` in `git show <branch>:docs/work/<ID>.md` when that branch exists locally
(`git rev-parse --verify --quiet <branch>`), else the one in the working tree.
`list` and the dependency check always use the effective status.

## Operations
- `create`: only on the default branch; stop otherwise. The next number is the highest
  existing `<n>` under `docs/work/` plus one. Write the file with status `todo` or `backlog`,
  then commit only the new files: `docs(work): add GRN-12, GRN-13`.
- `get`: Read the file from the issue's branch when it exists, else the working tree.
- `list`: `grep -l '^status: todo$' docs/work/*.md`, read only the frontmatter of the hits,
  drop any whose effective status is not `todo` (its branch already moved it), sort by
  priority with `0` last, then by number.
- `transition`: Edit the `status:` line on the issue's branch, then commit only that file:
  `chore(GRN-12): move to in-progress`. Append the log entry first when both happen together,
  so one commit carries them.
- `log`: append `### <YYYY-MM-DD> · <skill> · <title>` and the body under `## Log`. On the
  issue's branch, commit it with the next transition or as `docs(GRN-12): <title>`. Off it
  (a gate failure, a product decision), leave it uncommitted and tell the owner.

## Rules
- The owner marks `done`, usually as an edit inside the pull request before merging.
- Never renumber, delete or move an issue file. A cancelled issue gets a log entry and
  stays `backlog`.
- Labels, assignees and teams do not exist here: `type` and `module` are fields, and the
  repository is the team.
