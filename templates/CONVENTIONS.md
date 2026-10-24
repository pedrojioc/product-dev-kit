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
- Team: {team key}
- States: Backlog → Todo → In Progress → In Review → Done
- Branches: use the issue's gitBranchName
- Commits: conventional, with the issue ID as scope, e.g. `feat(ABC-12): ...`
