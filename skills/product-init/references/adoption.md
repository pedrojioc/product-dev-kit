# Adoption: building docs/product from existing Markdown

For a project that already wrote down what it does. The sources are evidence the owner
confirms, never facts the PM accepts on its own.

## 1. Inventory
- With paths in the arguments, use exactly those. Without them, Glob `**/*.md` and drop
  `node_modules/`, `.git/`, `vendor/`, `dist/`, `build/`, `docs/product/`, `docs/work/`,
  `CHANGELOG*`, `LICENSE*`, `CODE_OF_CONDUCT*` and `.github/`.
- Show the candidates as `path (lines)`, at most 30, largest folders grouped. Ask ONE
  question: which of these are product sources? Then STOP and wait.

## 2. Extract
Read only the confirmed sources. A source over 400 lines is read by section: its headings
first, then only the sections that carry product content.

Build a candidate list, one line each, `kind | text | path:line`:

| Kind | Goes to |
|---|---|
| module | `modules/<module>.md`, Purpose |
| term | INDEX.md glossary |
| rule | module Business rules, as `BR-<module>-<n>` |
| decision | `DECISIONS.md` |
| requirement | the final list for `/pdk:req-create` |
| question | module Open questions |

- Keep the source's meaning; rewrite only to make a rule testable, and say when you did.
- Two sources that disagree become one `conflict` candidate citing both. Never pick one.
- Anything that describes implementation (classes, tables, endpoints, libraries) is not a
  product candidate. Skip it.
- Never derive a candidate from code, and never fill a gap the sources leave.

## 3. Review, one module at a time
Show the module's candidates (max 15 lines; split a larger module) and ask the owner to
confirm, correct or drop each one. STOP and wait. Then:
- Confirmed or corrected: write it.
- Dropped: discard it.
- Unsure, or a conflict the owner does not settle now: `Open questions` of that module.

Terms and decisions that belong to no module are reviewed last, as one batch.

## 4. Decisions
Each confirmed decision gets an entry in `DECISIONS.md` with
`**Source**: <path:line>`. Its date is the one written in the source; when there is none,
`git log -1 --format=%as -- <path>`. `**Decided by**` is the owner, as confirmed now.

## 5. Gaps, then close
- Interview only what the sources did not cover, in the order of the main process.
- List the pending requirements found (title, `path:line`) and suggest `/pdk:req-create`.
  Do not create issues.
- Report the sources used and the files written. Leave the sources untouched: whether to
  delete, archive or link them is the owner's call.
