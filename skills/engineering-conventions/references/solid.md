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
Fix: split the port by consumer need (`CourseRepository` vs `CourseSearcher` query port).

## D - Dependency Inversion
High-level policy depends on abstractions it owns.
Signal: `import` of an ORM, SDK, `fetch`, `process.env`, `Date.now()` or `uuid()` in domain/application; `new SomeAdapter()` inside a use case.
Fix: define a port in business language, inject through the constructor, wire in the composition root. Inject clock and id generator for determinism.

## Companions
- Prefer composition over inheritance; inherit only from shared base classes (`AggregateRoot`, `ValueObject`).
- YAGNI: do not add a port or abstraction with a single speculative implementation beyond repository and external-service boundaries.
- Rule of three: duplicate twice, extract on the third occurrence.
- Small functions, early returns, guard clauses over nesting; names reveal intent; no comments explaining what.
- Tell, don't ask: call a behavior method rather than reading state and deciding outside.
