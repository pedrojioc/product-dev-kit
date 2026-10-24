# Testing

## Strict TDD loop
1. Red: write one failing test for one behavior; run it; see it fail for the right reason.
2. Green: write the least code to pass. No extra behavior.
3. Refactor with tests green; run all after each step.
Never write production code without a failing test. Commit per green+refactor unit.
Derive tests from the acceptance criteria (Gherkin); one scenario -> at least one test.

## Pyramid
| Level | Share | Scope | Collaborators |
|---|---|---|---|
| Unit: domain | most | aggregate, VO behavior, invariants | none |
| Unit: use case | many | orchestration | repository/event bus as test doubles |
| Integration: adapters | some | repository vs real DB, API client vs sandbox/contract | real tech, one adapter |
| Acceptance/E2E | few | critical happy path per feature through the driving adapter | whole app, real wiring |

## What to test where
- Domain: valid creation, each invalid input throws the typed error, each behavior method changes state and records the expected event.
- Use case: saves the expected aggregate; publishes the expected events; throws when precondition fails AND does not save; invalid input does not touch the repository.
- Repository: save then search round-trips an equal aggregate; absent returns null/throws as the port states; run the same contract against in-memory and real.
- Controller/acceptance: status code and body per scenario, error -> status mapping.

## Doubles
- Mock or fake ports only (repository, event bus, clock, id generator, external clients). Never mock domain objects, VOs or the class under test.
- Prefer an in-memory fake or a typed mock exposing intent: `repository.shouldSave(course)`, `eventBus.shouldPublish(events)`.
- Assert on outcomes (saved aggregate, published events), not on call counts of internals.

## Fixtures
- Object mother per aggregate and VO: `CourseMother.create(overrides?)`, `CourseNameMother.create()`; random valid data (faker), overridable via a partial.
- Builders when many optional fields. The test states only the data relevant to its assertion.
- Mothers live under `tests/` mirroring `src/` and never in production code.

## Naming and shape
- File mirrors subject: `CourseCreator.test.ts`. Names state behavior: `it("throws when the course already exists")`.
- Arrange / Act / Assert, separated by blank lines; one behavior per test; no logic or loops in tests.
- Do not assert exact generated values; assert equality with the mother-built expectation.

## Determinism
- Inject clock and id generator; no `Date.now()`, `Math.random()`, network, or shared DB state in unit tests.
- Seed or ignore volatile fields (eventId, occurredOn) via matchers.
- Integration tests create and clean their own data; order-independent; no sleeps (poll with timeout).
- A flaky test is a bug: fix or delete, never retry-until-green.

```ts
it("throws when the course already exists", async () => {
  const course = CourseMother.create();
  repository.shouldSearch(course);
  await expect(creator.run(course.toPrimitives())).rejects.toThrow(CourseAlreadyExist);
  repository.shouldNotSave();
});
```
