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
<ports, class names, method signatures, error types, event shapes, DTOs>
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
# Task packet: SHP-7 / create course use case
## Objective
Add CreateCourse that persists a new Course and publishes CourseCreated.
## Acceptance criteria covered
Scenario: Create a valid course
  Given no course with id "c1" exists
  When I create a course with id "c1" and name "DDD"
  Then the course "c1" is stored
Scenario: Reject duplicate id
  Given a course with id "c1" exists
  When I create a course with id "c1"
  Then it fails with CourseAlreadyExist
## Allowed files
Create: src/contexts/learning/course/application/create/create-course.ts, tests/contexts/learning/course/application/create-course.spec.ts
Modify: none
## Interfaces and signatures already decided
CreateCourse.run(id: string, name: string): Promise<void>
CourseRepository (exists, abstract class): save(c: Course), search(id: CourseId): Course | null
CourseAlreadyExist extends BusinessRuleViolationException (exists)
## Tests to write first
1. "creates a course" -> repository saved CourseMother equal to input
2. "throws when the course already exists" -> rejects, nothing saved
## Conventions excerpt
- Use case: plain class with run(); primitives in, aggregate builds VOs, save one aggregate, then publish pullDomainEvents().
- Mock ports only (jest.Mocked); use CourseMother.
## Done when
Tests green, typecheck clean, only the 2 files changed, commit `feat(SHP-7): add create course use case`.
## Response format (max 15 lines)
Files changed / Tests added + result / Doubts
```
