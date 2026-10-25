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

## Linear
- Workspace: `{Linear workspace name}`. Team key: `{TEAM}`. The key is defined in Linear (Team settings > General > Identifier); this file only says which team this repo uses. Issue IDs are `{TEAM}-<n>`.
- One Linear team per product. Projects (e.g. Backend, Frontend) group issues inside the team but never change the ID prefix.
- Project: `{Linear project name, optional}`.
- States: Backlog → Todo → In Progress → In Review → Done. There is no Blocked state: a blocked issue stays in Todo with a "blocked by" relation and a comment.
- Type labels: `Feature`, `Bug`, `Improvement` (use `Improvement` for chores and refactors). Module label: `module:{name}`, created on demand.
- Branches: use the issue's gitBranchName
- Commits: conventional, with the issue ID as scope, e.g. `feat({TEAM}-12): ...`
