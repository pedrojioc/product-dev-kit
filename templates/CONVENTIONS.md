# Engineering conventions (project)

This file overrides the generic pdk conventions when they conflict.

## Stack
- Language / runtime: {e.g. TypeScript, Node 22}
- Test runner: {e.g. vitest}

## Commands
- Test: `{command}`
- Lint: `{command}`
- Typecheck: `{command}`

## Structure
{Folder layout per module and layer, e.g. src/{module}/{domain,application,infrastructure}}

## Project rules
- {Naming, error handling, dependency rules specific to this repo}

## Linear
- Workspace: Grupo Avanza. Team key: `GRU` (the only team; issue IDs are `GRU-<n>`).
- Project: `{Linear project name of this product}`. Each product maps to one Linear project, never to a new team.
- States: Backlog → Todo → In Progress → In Review → Done. There is no Blocked state: a blocked issue stays in Todo with a "blocked by" relation and a comment.
- Type labels: `Feature`, `Bug`, `Improvement` (use `Improvement` for chores and refactors). Module label: `module:{name}`, created on demand.
- Branches: use the issue's gitBranchName
- Commits: conventional, with the issue ID as scope, e.g. `feat(GRU-12): ...`
