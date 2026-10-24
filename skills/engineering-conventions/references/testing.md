# Testing

## Strict TDD loop
1. Red: one failing test for one behavior; run it; see it fail for the right reason.
2. Green: least code to pass. 3. Refactor with tests green; run all after each step.
Never write production code without a failing test. Derive tests from the acceptance criteria (Gherkin); one scenario -> at least one test.

## Layout and naming
- `tests/` mirrors `src/`: `tests/contexts/<ctx>/<module>/{domain,application,infrastructure,presentation}/`; cross-cutting code under `tests/shared/`; e2e under `tests/e2e/`.
- Files kebab-case: `create-ingredient-category.spec.ts`; e2e `*.e2e-spec.ts`. Large aggregates split by behavior: `order-add-items.spec.ts`, `order-cancel-item.spec.ts`.
- Names state behavior: `it('should throw OrderCannotBeModified when order is CLOSED')`. Arrange / Act / Assert, one behavior per test, no loops or logic.
- Two Jest projects: `unit` (`pnpm test`, no external services) and `e2e` (`pnpm test:e2e`, `--runInBand`).

## Pyramid
| Level | Share | Scope | Collaborators |
|---|---|---|---|
| Domain unit | most | aggregate, VO, invariants, recorded events | none |
| Use case unit | many | orchestration | port mocks |
| Adapter | some | repository, cross-context adapter, subscriber | one real or in-memory collaborator |
| e2e | few | critical flows through HTTP | real Postgres, whole app |

## What to test where
- Domain: valid creation; each invalid input throws the typed exception; each behavior changes state and records the expected event (drain with `pullDomainEvents()` before the act).
- Use case: saved aggregate (via `toPrimitives()`), published event types (`instanceof`), precondition failure throws AND does not save.
- Subscriber: given the event, calls the port with translated data; one spec per subscriber.
- Repository: save then search round-trips an equal aggregate (`toPrimitives()` equality), nulls, absent -> null. Postgres-specific behavior (jsonb, partial indexes, `SKIP LOCKED`, concurrency, replace-children) belongs in e2e, not SQLite.
- Atomicity: specs proving rollback when a synchronous subscriber fails (`*.uow-atomicity.spec.ts`); controller specs proving the transaction interceptor is applied on mutating routes.
- Request DTOs with non-trivial validation get their own spec.

## Doubles
- Mock only ports: repository, `EventBus`, query service, cross-context port. Never mock domain objects, VOs or the class under test.
- Plain typed objects: `repository = { save: jest.fn(), search: jest.fn() } as jest.Mocked<CourseRepository>`; `eventBus = { publish: jest.fn() }`. Assert outcomes (saved aggregate, published events), not internals or call order.

## Fixtures
- Object mother per aggregate: `tests/contexts/<ctx>/<module>/__mothers__/<aggregate>.mother.ts`, with `create(overrides?: Partial<Primitives>)` building through `fromPrimitives`, plus named states (`inactive()`, `inProgress()`). Shared primitives in `tests/shared/__mothers__/` (`UuidMother.random()`).
- Random valid data via faker, overridable; the test states only what its assertion needs. Never in production code.

## Determinism
- Inject clock and id generator; no `Date.now()`, `Math.random()`, network or shared DB state in unit tests. Ignore volatile fields (eventId, occurredOn) via matchers.
- A flaky test is a bug: fix or delete, never retry-until-green.

## e2e (Postgres via Testcontainers)
- Container starts in Jest `globalSetup`, runs all migrations, stops in teardown. Docker required. No env override of the DB URL.
- Default style: boot the full app, drive real requests with `supertest`, mint a real JWT; do not seed users/roles.
- Reset with one shared helper (`truncateTables`/`resetDatabase`), not ad hoc DELETE. A hand-wired (non-HTTP) spec must state its reason in a comment.
- Each test creates its own data; order-independent; no sleeps (poll with timeout).

```ts
it('should publish IngredientCategoryCreatedEvent', async () => {
  await useCase.run(UuidMother.random(), 'Dairy', null, null, null, null, true)

  const events = eventBus.publish.mock.calls[0][0]
  expect(events[0]).toBeInstanceOf(IngredientCategoryCreatedEvent)
})
```
