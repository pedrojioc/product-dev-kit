# Testing

## Strict TDD loop (outside-in)
1. Red: one failing test for one behavior; run it; see it fail for the right reason.
2. Green: least code to pass. 3. Refactor with tests green; run all after each step.
- Per use case, outside-in: (1) use-case test with fake ports, which discovers the ports; (2) domain code until it passes; (3) adapters last (repository, controller/listener), each with its own tests.
- Never write production code without a failing test. One acceptance scenario -> at least one test.
- Commands: `pnpm --filter api test`, plus `build` and `lint` before committing (ts-jest erases types).

## Layout and naming
- Specs are colocated: `register-animal.spec.ts` beside `register-animal.ts`. Jest regex `.*\.spec\.ts$`, ESM mode, `.js` imports mapped.
- Module specs (`<module>.module.spec.ts`) boot `NestFactory.createApplicationContext` with the real module and fake neighbor modules; they prove wiring and the exported contract.
- Specs wiring several contexts live in `src/integration/` (event flows such as farrowing -> litter).
- `src/architecture.spec.ts` fails on any cross-context import.
- `describe('<ClassName>')`, `it` states the behavior in business language and cites the requirement id when one exists: `it('rejects a repeat dated before the service (R-03.3)')`. Arrange / Act / Assert, one behavior per test.

## Pyramid
| Level | Scope | Collaborators |
|---|---|---|
| Domain unit | aggregate, VO, invariants, recorded events | none |
| Use case | orchestration | in-memory repos + fakes of ports |
| Subscriber, adapter | event reaction, ACL adapter, repository | one fake or real collaborator |
| Module / integration | wiring, event flows | Nest context with fake neighbors |
| HTTP e2e (when controllers exist) | critical flows via the real app | supertest, real database |

## What to assert
- Domain: valid creation; each invalid input throws the typed exception; each behavior changes state and records the expected event.
- Use case: returned summary and saved state; published event names/payloads; a failing precondition throws AND saves nothing AND publishes nothing; a failing save publishes nothing.
- Subscriber: idempotent (second delivery is a no-op), ignores unknown name/version, translates payload.
- Repository: save then find round-trips an equal aggregate; absent -> null.

## Doubles
- Fakes are classes extending the abstract port, not `jest.fn()` mocks. Reuse the in-memory repository, subclassed to inject failure (`RecordingRepository extends InMemory... { failing = false }`).
- Project-wide fixtures in `shared/<layer>/fixtures/`: `FakeClock`, `SequentialIdGenerator`, `RecordingIntegrationEventPublisher`. Each fixture has its own spec.
- Never mock domain objects, VOs or the class under test. Assert outcomes, not call order.

## Fixtures and determinism
- No object mothers or builders: each spec declares a local `setup()` returning the use case and fakes, and small factory functions for inputs; the test states only what its assertion needs.
- Inject clock and id generator; no `Date.now()`, `Math.random()`, network or shared state. Use fixed ISO dates; cover day boundaries.
- A flaky test is a bug: fix or delete.
