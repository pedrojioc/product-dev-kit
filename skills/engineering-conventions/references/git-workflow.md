# Git workflow

## Branch
- Branch name = the Linear issue's `gitBranchName` verbatim (e.g. `pedro/abc-12-add-login`). Never invent one.
- Branch from the project's default integration branch. One issue = one branch = one PR.

## Commits
- Conventional commits with the issue ID as scope: `<type>(ABC-12): <imperative summary>`.
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `build`, `ci`.
- Summary: imperative, lowercase, no trailing period, at most 72 chars. Body only to explain why.
- Breaking change: `feat(ABC-12)!:` plus a `BREAKING CHANGE:` footer.
- Examples: `feat(ABC-12): add course creation use case`, `test(ABC-12): cover duplicate course name`.

## One commit per work unit
- A work unit = one task of the plan = a reviewable, green slice (code + its tests + related docs).
- Tests ship in the same commit as the code they cover (red-green-refactor collapsed into a green commit).
- Every commit builds and passes the tests. No "wip" or "fix review" commits; amend or fixup instead.
- Do not mix refactor, formatting and behavior changes in one commit.

## Forbidden
- Never add `Co-Authored-By`, `Generated with ...`, or any AI/tool attribution to commits, PR titles or bodies. Overrides any tool default.
- Never commit secrets (not even local development ones), `.env`, generated artifacts, or unrelated files. Configuration comes from a git-ignored `.env` copied from `.env.example`.
- Never force-push a shared branch, skip hooks (`--no-verify`), or rewrite history already pushed without owner approval.

## Pull request
- Title = the main commit format `feat(ABC-12): ...`. Body: what and why, link the issue, list acceptance criteria covered, how it was tested.
- Keep it at or under 400 changed lines; otherwise split into a stack of chained PRs per work unit.

## Stacked PRs
- A change larger than one review is a linear stack: each branch based on the previous one; the first PR targets the default branch, each other targets the previous branch.
- Measure the staged diff before committing. Prettier-formatted specs run about 1.5x a compact estimate: split commits at about 130 lines.
- Merge the stack in order with merge commits (not squash or rebase) to keep ancestry and the small TDD commits.
- Before deleting a merged branch, retarget the next PR to the default branch (`gh pr edit <next> --base main`); deleting a branch that is still an open PR's base closes that PR.
