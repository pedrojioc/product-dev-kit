# Testing

## Strict TDD loop (outside-in)
1. Red: one failing test for one behavior; run it; see it fail for the right reason.
2. Green: least code to pass. 3. Refactor with tests green; run all after each step.
- Per use case, outside-in: (1) use-case test with fake ports, which discovers the ports; (2) domain code until it passes; (3) adapters last (repository, controller/listener), each with its own tests.
- Never write production code without a failing test. One acceptance scenario -> at least one test.
- Commands: `pnpm --filter api test`, plus `build` and `lint` before committing (ts-jest erases types).

## Layout and naming
- All tests live under a top-level `tests/` (per app: `apps/api/tests/` mirrors `apps/api/src/`). Never next to production code.
- The path under `tests/` mirrors the path under `src/` exactly, same file name plus `.spec.ts`: `src/contexts/<ctx>/<module>/application/register-animal.ts` -> `tests/contexts/<ctx>/<module>/application/register-animal.spec.ts`. One spec file per production file under test.
- Module wiring specs boot `NestFactory.createApplicationContext` with the real module and fake neighbor modules; they prove wiring and the exported contract. They mirror the module path (`tests/.../<module>.module.spec.ts`).
- Cross-cutting specs: event flows across contexts in `tests/integration/`, `tests/architecture.spec.ts` (fails on any cross-context import), e2e in `tests/e2e/`.
- Tests import production code with relative paths ending in `.js`; no aliases.
- Runner config: Jest `rootDir`/`roots` must include `tests/`; regex `.*\.spec\.ts$`, ESM mode, `.js` imports mapped.
- `describe('<ClassName>')`, `it` states the behavior in business language and cites the requirement id when one exists: `it('rejects a repeat dated before the service (R-03.3)')`. Arrange / Act / Assert, one behavior per test.

## Pyramid
| Level | Scope | Collaborators |
|---|---|---|
| Domain unit | aggregate, VO, invariants, recorded events | none |
| Use case | orchestration | in-memory repos + fakes of ports |
| Subscriber, adapter | event reaction, ACL adapter, repository | one fake or real collaborator |
| Module / integration | wiring, event flows | Nest context with fake neighbors |
| HTTP e2e (when controllers exist) | critical flows via the real app | supertest, real Postgres via Testcontainers |

## What to assert
- Domain: valid creation; each invalid input throws the typed exception; each behavior changes state and records the expected event.
- Use case: returned summary and saved state; published event names/payloads; a failing precondition throws AND saves nothing AND publishes nothing; a failing save publishes nothing.
- Subscriber: idempotent (second delivery is a no-op), ignores unknown name/version, translates payload.
- Repository: save then find round-trips an equal aggregate; absent -> null.

## Doubles
- Unit and module specs use fakes and no database. E2E runs against a real Postgres through Testcontainers: no docker-compose dependency, no SQLite for Postgres-specific behavior.
- Fakes are classes extending the abstract port, not `jest.fn()` mocks. Reuse the in-memory repository, subclassed to inject failure (`RecordingRepository extends InMemory... { failing = false }`).
- Shared helpers (fakes, in-memory repositories, input factories) live in `tests/`, mirroring the port they implement (fakes of `src/.../application/ports/x.port.ts` in `tests/.../application/ports/`), never in `src/`. Project-wide ones (`FakeClock`, `SequentialIdGenerator`, `RecordingIntegrationEventPublisher`) mirror `src/shared/`. Each helper has its own spec.
- Never mock domain objects, VOs or the class under test. Assert outcomes, not call order.

## Fixtures and determinism
- No object mothers or builders by default: each spec has a local `setup()` returning the subject and its fakes, plus small input factory functions; the test states only what its assertion needs. Allow a mother for an aggregate only when more than ~10 tests repeat its construction data.
- Inject clock and id generator; no `Date.now()`, `Math.random()`, network or shared state. Use fixed ISO dates; cover day boundaries.
- A flaky test is a bug: fix or delete.
