# SOLID

## S - Single Responsibility
A module has one reason to change (one actor/concern).
Signal: class name needs "And"/"Manager"; a use case with 3+ unrelated collaborators; a file edited for unrelated features.
Fix: split by reason to change; one use case per file; move rules into the aggregate.

## O - Open/Closed
Add behavior by adding code, not editing stable code.
Signal: growing `switch`/`if` on a type or adapter name; every new variant edits the same function.
Fix: introduce a port or strategy, one implementation per variant, select in the composition root.

## L - Liskov Substitution
Any implementation of a port works wherever the port is used.
Signal: `instanceof` checks on a port; adapter throws "not supported"; in-memory fake behaves differently from the real one (e.g. ordering, uniqueness).
Fix: tighten the port contract, share a contract test run against every adapter.

## I - Interface Segregation
Clients depend only on methods they use.
Signal: mocks stubbing many unused methods; a port with 10+ methods; use case using 1 of them.
Fix: split the port by consumer need (`CourseRepository` vs `CourseQueryService`). One use case per file keeps ports small.

## D - Dependency Inversion
High-level policy depends on abstractions it owns.
Signal: `import` of an ORM, SDK, `fetch`, `process.env`, `Date.now()` or `uuid()` in domain/application; `new SomeAdapter()` inside a use case.
Fix: define a port (abstract class = DI token) in business language, inject through the constructor, wire in the module's composition root. Inject clock and id generator for determinism.

## Companions
- Prefer composition over inheritance; inherit only from shared base classes (`AggregateRoot`, `ValueObject`).
- YAGNI: no port or abstraction with a single speculative implementation beyond repository, query-service and cross-context boundaries. Delete abstractions nobody consumes (unused bus ports, token maps).
- Rule of three: duplicate twice, extract on the third occurrence.
- Small functions, early returns, guard clauses over nesting; names reveal intent; no comments explaining what.
- Tell, don't ask: call a behavior method rather than reading state and deciding outside.

## Style and lint (enforced in CI: `lint:check` + `format:check`)
- Prettier: no semicolons, single quotes, no trailing commas, 2 spaces, width 100, `arrowParens: avoid`, LF.
- ESLint flat config: `eslint:recommended` + `typescript-eslint` recommended + Prettier as an error. `require-await` is an error, `no-unused-vars` a warning; `no-explicit-any` is off (tolerated in test doubles only).
- Imports use path aliases (`@/`, `@shared`, `@contexts`, `@test`), never deep `../../..` across modules; relative only inside a module.
- Comments explain why or business rules (use case header: rules + events); never what the code says.
