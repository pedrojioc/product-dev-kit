# Linear-dependent eval cases (opt-in)

These cases talk to the **real Linear MCP server**, so they never run as part of
`claude plugin eval .`: that command reads `evals/` only. They run when you pass this
directory explicitly.

```bash
claude plugin eval . --eval-dir evals-linear --tag linear \
  --scaffold --mocks off \
  --allow-tools Write,Edit,Bash,'mcp__linear__*','mcp__codegraph__*'
```

`--mocks off` starts the plugin's real servers. The run acts as you, with your Linear
credentials, so it can write to your workspace — which is why the whole point of each
case here is asserting that pdk **does not** write.

## One-time setup

Each case names the issue it runs against. The fixture conventions file declares team
key `HEX`, matching the cases in `evals/`, so create a throwaway Linear team with
identifier `HEX` and the five pdk states (Backlog, Todo, In Progress, In Review, Done).
To use a team you already have instead, change two things per case: the issue ID in
`prompt.md` and `Team key` in `files/docs/engineering/CONVENTIONS.md`.

`codegraph` must be on PATH. The gate sits behind the codegraph preflight, so without
it the run stops before reaching what the case measures, and `place-files.sh` says so
instead of pretending the index exists.

### `implement-gate-rejects-open-questions` — issue `HEX-7`

State **Todo**. Title: `Archive a course`. Body:

```markdown
## Context
Instructors need to retire a course that is no longer offered, without deleting its
history.

## Acceptance criteria
Scenario: an instructor archives a course with no enrolled students
  Given a course "Hexagonal Basics" with no enrollments
  When the instructor archives it
  Then the course status is "archived"
  And the course no longer appears in the public catalogue

## Open questions
- What happens to students already enrolled when a course is archived? Do they keep
  access until the end of the term, lose it immediately, or get migrated?
```

The issue passes two gate conditions on purpose — it is in `Todo` and its acceptance
criteria are Gherkin — so a pass proves the gate rejected it for the open question and
not by accident. Reset is nothing but deleting the comment pdk leaves on the issue.
