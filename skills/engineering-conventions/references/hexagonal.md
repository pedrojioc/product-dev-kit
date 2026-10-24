# Hexagonal / onion architecture

## Layout
```
src/contexts/<bounded-context>/<module>/      module = one aggregate root (+ its child entities)
  domain/          aggregate, VOs (flat), events/, exceptions/, repositories/, services/
  application/     <verb>/<verb>-<entity>.ts per use case, dto/, ports/, services/ (query ports), subscribers/, exceptions/
  infrastructure/  persistence/<tech>/, query-services/, adapters/
  presentation/    http/controllers/, http/dto/ (request validation)
  <module>.module.ts   composition root: the only place wiring adapters to ports
src/shared/<layer>/    technical base only (AggregateRoot, VO bases, Criteria, EventBus, unit of work). No business concepts.
src/contexts/shared-kernel/   concepts shared by several contexts; consumed through ports like any other context.
```
- Name contexts and modules in the business's ubiquitous language (`menu`, not `catalog`; `kitchen`, not `production`).
- The layer is named `presentation/`. Group by context/module first, then layer; never a global `controllers/` or `services/`.

## Dependency rule
- presentation -> application -> domain. infrastructure implements ports owned by domain/application.
- domain imports nothing outside domain: no framework, decorators, ORM, SDK, HTTP, env. Verify with grep on `domain/`.
- application imports domain and its own ports only; never an adapter, ORM or framework type.
- A module may call a sibling module of the SAME context directly (its use case). Crossing a bounded context ALWAYS goes through a port: `application/ports/<name>.port.ts` (abstract class) in the caller, implemented by `infrastructure/adapters/<name>.adapter.ts`, which calls the other context's use case (its public application service), never its domain or repository. No exception for shared-kernel.
- Other contexts' domain events may be subscribed to; translate the payload to local types on receipt (see domain-design).

## Ports and adapters
- A port is an `abstract class` named in business language; the class itself is the DI token. No `interface` + `Symbol` pair, no token maps.
- Repository port: `domain/repositories/<aggregate>.repository.ts`, one per aggregate root, returns aggregates. Impl: `infrastructure/persistence/<tech>/<tech>-<aggregate>.repository.ts`.
- Read port (query service): `application/services/<aggregate>-query.service.ts`, returns read-model DTOs and `PaginatedResult`, never aggregates; impl in `infrastructure/query-services/`. Use it only when the read shape diverges from the aggregate (lists, filters, joins); a lookup matching the aggregate uses the repository.
- Non-persistence ports (clock, mailer, other contexts): `application/ports/`. Ports a domain service needs (hasher) live in `domain/services/`.
- The core must run unchanged against a swapped adapter (in-memory vs Postgres). If a core edit is needed for one adapter, the port leaks.
- Infrastructure holds no business rule: only fetch, persist, translate.

## Where code lives
| Code | Location |
|---|---|
| Invariant, business rule | domain (aggregate or VO) |
| Orchestration: load, call, save one aggregate, publish | application use case |
| Response DTO and read-model shapes | `application/dto/` (never presentation) |
| ORM entities, SQL, mapping aggregate <-> row | infrastructure |
| Request parsing/validation, status codes, auth guards | presentation |

## Naming
- Files kebab-case, one class per file, named after the class: `create-product.ts`, `product-name.ts`.
- Suffixes: `.event.ts`, `.exception.ts`, `.repository.ts`, `.port.ts`, `.adapter.ts`, `.request.ts`, `.response.ts`, `.entity.ts`, `.service.ts`, `.mother.ts`. VOs have no suffix.
- No barrel files in `src/`; import by path alias.

## Anti-patterns
- Anemic domain; controller with rules or repository access; ORM entity used as aggregate.
- Cross-context import of another context's `domain/` or repository from application.
- Two orchestration styles (plain `.run()` and command/query bus) in one codebase: pick plain use cases.
- Second exception filter or dead abstraction kept "just in case": delete unused ports.
