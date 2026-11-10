# Engineering conventions (project)

This file overrides the generic pdk conventions when they conflict.
Run `/pdk:setup` to generate it with the values of this repository instead of filling it in by hand.

## Stack
- Language / runtime: {e.g. TypeScript, Node 22}
- Test runner: {e.g. vitest}

## Commands
- Test: `{command}`
- Lint: `{command}`
- Typecheck: `{command}`
- CodeGraph index: `codegraph init` (required once per checkout; each worktree needs its own `.codegraph/`)

## Structure
{Folder layout per module and layer, e.g. src/{module}/{domain,application,infrastructure}}

## Project rules
- {Naming, error handling, dependency rules specific to this repo}

## Tracker
- Backend: `{files | linear}`. `files` keeps issues in `docs/work/<ID>.md`; `linear` uses the Linear team below. The port is `tracker/port.md` in the pdk plugin.
- Issue ID prefix: `{PREFIX}`. Issue IDs are `{PREFIX}-<n>`. With Linear, the prefix is the team identifier (Team settings > General > Identifier).
- Linear workspace and team: `{workspace / team, or "none" with the files backend}`. One team per product.
- Project: `{project name, optional}`. Projects group issues but never change the ID prefix.
- Statuses: backlog → todo → in-progress → in-review → done. There is no blocked status: a blocked issue stays in todo with `blocked_by` and a log entry.
- Types: `feature`, `bug`, `improvement` (use `improvement` for chores and refactors). Module: `module:<name>`.
- Branches: the issue's `branch` field (Linear: its gitBranchName).
- Commits: conventional, with the issue ID as scope, e.g. `feat({PREFIX}-12): ...`
