# Task packet: worked example

Format and rules: `task-packet.md`. This unit is application-only; a unit that also
creates its VO lists `domain-design.md` under Layers as well.

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
## Required reading (all of it, before the first test)
Project: /Users/pedro/Projects/granular/docs/engineering/CONVENTIONS.md
Layers: <plugin>/skills/engineering-conventions/references/use-cases.md
        <plugin>/skills/engineering-conventions/references/data-flow.md
        <plugin>/skills/engineering-conventions/references/hexagonal.md
        <plugin>/skills/engineering-conventions/references/testing.md
        <plugin>/skills/engineering-conventions/references/solid.md
Mirror: src/contexts/learning/enrollment/application/enroll-student.ts - plain class, one
        run(input) of primitives, VOs built inside, saves one aggregate, returns a summary
Precedence: this packet's signatures > project CONVENTIONS.md > references.
These say HOW to write what this packet names. They never authorize adding what it does not name.
## Allowed files
Create: src/contexts/learning/course/application/register-course.ts,
        src/contexts/learning/course/application/course-summary.ts,
        tests/contexts/learning/course/application/register-course.spec.ts
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
## Conventions excerpt (deviations only)
- No deviations from the references.
- Most broken here: the use case must NOT re-check what CourseName already validates.
## Done when
Tests green, build and lint clean, only the allowed files changed, commit `feat(SHP-7): add register course use case`.
Report the application self-check: one repository save, no query service needed, nothing published, summary carries no VO or aggregate.
## Response format (max 15 lines)
Files changed / Tests added + result / Doubts
```
