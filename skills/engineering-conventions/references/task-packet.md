# Task packet

The only context an implementer gets. The Tech Lead writes one per work unit, self-contained and minimal.

## Rules
- Implementer must NOT read the full Linear issue or `docs/product`. If the packet is insufficient, return a doubt (see when-in-doubt).
- Implementer touches only "Allowed files" and follows "Tests to write first" in strict TDD order.
- Conventions excerpt: copy only the lines from CONVENTIONS.md and these references that this packet needs. No whole files.
- One packet = one work unit = one commit (see git-workflow).

## Format
```
# Task packet: <ABC-12> / <unit name>
## Objective
<1-3 sentences: the behavior to deliver and why it is bounded this way>
## Acceptance criteria covered
<verbatim Gherkin scenarios from the issue; no paraphrase>
## Allowed files
Create: <paths>
Modify: <paths>
Nothing else.
## Interfaces and signatures already decided
<ports, class names, method signatures, input and summary types, error types, event shapes>
## Tests to write first
<ordered list: file, test name, what it asserts; red before green>
## Conventions excerpt
<only relevant lines>
## Done when
<checklist: tests pass, lint/typecheck pass, only allowed files changed, commit made>
## Response format (max 15 lines)
Files changed: <list>
Tests added + result: <names, pass/fail>
Doubts: <none | numbered questions>
```

## Example
```
# Task packet: SHP-7 / register course use case
## Objective
Add RegisterCourse that creates and saves a Course and returns its summary.
## Acceptance criteria covered
Scenario: Register a valid course
  Given no active course with name "DDD" exists
  When I register a course named "DDD"
  Then the course is stored and its summary is returned
Scenario: Reject duplicate name
  Given an active course named "DDD" exists
  When I register a course named "DDD"
  Then it fails with BusinessRuleViolationException and nothing is saved
## Allowed files
Create: src/contexts/learning/course/application/register-course.ts, register-course.spec.ts, course-summary.ts
Modify: none
Nothing else.
## Interfaces and signatures already decided
RegisterCourse.run(input: { name: string }): Promise<CourseSummary>
CourseSummary { id: string; name: string; status: string } via toCourseSummary(course)
CourseRepository (exists, abstract class): save(c: Course), existsActiveWithName(n: CourseName)
IdGenerator (shared port) supplies the UUID v7; Course.register({ id, name }) exists.
## Tests to write first
1. "registers a course with a generated id and returns its summary" -> saved and summary equal
2. "rejects a name held by an active course and saves nothing" -> rejects, nothing saved
## Conventions excerpt
- Use case: plain class, one `run(input)`, VOs built inside, save one aggregate, return a summary (no aggregate).
- Fakes extend the abstract port; InMemoryCourseRepository and SequentialIdGenerator in the spec.
## Done when
Tests green, build and lint clean, only the allowed files changed, commit `feat(SHP-7): add register course use case`.
## Response format (max 15 lines)
Files changed / Tests added + result / Doubts
```
