# Hexagonal architecture (ports and adapters)

## Layout
```
src/contexts/<context>/<module>/     package-by-feature; module = one aggregate root (+ its child entities)
  domain/          aggregate, VOs (flat siblings), domain events, repository port, policies, domain services
  application/     <verb>-<entity>.ts use cases (flat), <entity>-summary.ts, ports/, subscribers/, integration/ (event mappers)
  infrastructure/  driven adapters: in-memory-<aggregate>-repository.ts | persistence/<tech>/, query-services/, <port>.adapter.ts
  interface/       driving adapters: http/ (controllers, request DTOs), events/ (<event>.listener.ts)
  <module>.module.ts   composition root: the only place wiring adapters to ports
src/shared/{domain,application,infrastructure,integration-events,integration-queries}   project-wide kernel
tests/             all tests, outside src/: mirror of src/ (per app: apps/api/tests/ mirrors apps/api/src/)
  contexts/<ctx>/<module>/...   same folders as src/, file name + .spec.ts
  integration/     cross-context event-flow specs
  e2e/             HTTP e2e specs
  architecture.spec.ts
```
- Tests never sit next to production code. Details in testing.md.
- The driving-adapter layer is named `interface/`, never `presentation/`. Placement test: does it call INTO the core (interface) or is it called OUT to (infrastructure)? Both are peers; neither is lesser.
- Name contexts and modules in the ubiquitous language. Group by context/module first, then layer; never a global `controllers/` or `services/`.
- `src/shared/` holds only generic concepts any future context reuses verbatim (aggregate root, VO bases, exceptions, clock, id generator, event bus). Vocabulary of one context shared by 2+ of its modules goes in `contexts/<context>/shared/domain/`, created only when needed.

## Dependency rule
- Adapters depend inward on ports. `domain/` and `application/` import no framework, ORM, SDK, HTTP or env; verify by grep.
- The core must run unchanged against a swapped adapter (in-memory vs real DB). A core edit needed for one adapter means the port leaks.
- Contexts NEVER import each other (production or test code). `tests/architecture.spec.ts` scans imports and fails the build.
- Contexts meet only through neutral contracts in `src/shared/`:
  - `integration-events/`: plain readonly DTO `{ eventId, name, version, occurredAt (ISO), payload }`, payload primitives only. Stable name plus numeric `version` (no `.v1` in names). Published in-process after a successful save. Subscribers are idempotent by business key, never by `eventId`.
  - `integration-queries/`: one abstract-class lookup per cross-context read, implemented by the owner's adapter (it calls its own use case), consumed through a local port in `application/ports/` plus an anti-corruption adapter in `infrastructure/`.
- Never import another context's domain, application or repository, not even via shared-kernel shortcuts.
- Sibling modules in the same context talk like contexts, minus the shared event layer: the consumer declares an abstract port in its `application/ports/`; an adapter in its `infrastructure/adapters/` calls the other module's exported use case. Never import the other module's domain or repository.

## Ports and adapters
- A port is an `abstract class` in business language; the class is the DI token. Never `interface` + `Symbol`.
- Ports are small role interfaces shaped by what a use case needs, never header interfaces mirroring a class. A port exists only when a use case in the current step needs it.
- Repository port: `domain/<aggregate>-repository.ts`, one per aggregate root, returns aggregates (`save`, `findById`, intent-named queries). Impl: `infrastructure/in-memory-<aggregate>-repository.ts` or `persistence/<tech>/`.
- Read port (query service): `application/services/<x>-query.service.ts`, returns read-model DTOs, only when the read shape diverges from the aggregate. Impl in `infrastructure/query-services/`.
- Non-persistence ports (clock, id generator, event publisher, cross-context lookups): `application/ports/`, or `shared/` when generic.
- Infrastructure holds no business rule: only fetch, persist, translate.

## Naming
- Files kebab-case, one main class per file named after it: `register-animal.ts`, `animal-tag.ts`. VOs and events carry no suffix.
- Suffixes only: `.exception.ts`, `.event.ts` (integration events), `.adapter.ts`, `.listener.ts`, `.module.ts`, `.mapper.ts`, `.spec.ts`.
- No barrel files. Relative imports with the explicit `.js` extension (NodeNext ESM); no path aliases.

## Anti-patterns
- Anemic domain; controller with rules, repository access or domain imports; ORM row used as aggregate.
- Any cross-context import; a sibling-module domain/repository import; tests inside `src/`; two orchestration styles (plain `run()` vs command bus) in one codebase.
- Unused ports or abstractions kept "just in case".
