# Data flow and DTOs across layers

Rule: nothing typed by an inner layer leaves it. Domain objects never cross the application boundary; transport shapes never enter the core.

## Inbound (driving adapter -> core)
| Step | Layer | Receives | Returns | Who maps |
|---|---|---|---|---|
| 1 | interface | HTTP body/params, or integration event | - | validates the wire shape (request DTO, wire types: strings, numbers) |
| 2 | interface | validated request | `<UseCase>Input` | the controller/listener turns it into primitives, `Date`, literals |
| 3 | application | `<UseCase>Input` | summary | the use case builds VOs and calls the aggregate |
| 4 | domain | VOs | aggregate state + domain events | the aggregate |
| 5 | application | aggregate | `<Entity>Summary` | `to<Entity>Summary(aggregate)`, pure function in the application layer |
| 6 | interface | summary | HTTP response | nobody: the controller returns the summary unchanged |

## Types and where they live
- Request DTO: class in `interface/http/` validated with class-validator (+ class-transformer); wire-level validation only. Never reaches or is imported by application; the controller maps it to `<UseCase>Input`.
- `<UseCase>Input`: `application/<use-case>.ts`. Plain object of primitives; no VO, no aggregate.
- `<Entity>Summary` (read model): `application/<entity>-summary.ts` with `to<Entity>Summary`. Flat plain object: primitives, `Date`, string literals, nested plain objects. No VO, aggregate, entity, or class instance. If another context needs it, the type moves to `shared/integration-queries/`.
- Commands return the summary of the resulting state, or nothing when there is nothing to tell. Queries return a summary or a read-model DTO from a query service.
- Response shape = the summary. A controller never calls `fromDomain`/`toResponse`/any mapping on an aggregate, never imports a domain type; domain exceptions map to HTTP only in the one global filter.
- Aggregates are never returned by a use case that an adapter calls. A use case returning an aggregate is only an internal helper used by other application code.

## Outbound and cross-context
- Domain event (domain objects) -> `application/integration/*.mapper.ts` -> integration event (primitives, ISO strings) -> `IntegrationEventPublisher` after the save.
- Receiving side: the subscriber turns the payload into local VOs/aggregates; the foreign shape goes no deeper.
- Cross-context read: `integration-queries` lookup returns a neutral summary; the consumer maps it to its own local type in its ACL adapter.

## Persistence (driven adapter)
- Repository adapter maps aggregate <-> storage row inside `infrastructure/`; the row type never leaves it. Query services map rows straight to read-model DTOs with no aggregate restore.
- Only the repository rebuilds aggregates from rows, through `Aggregate.restore(props)` (domain-design.md).
