# Decision gates

WHEN to reach for each pattern. The Tech Lead reads this at design time and resolves it
into the packet's signatures. An implementer never picks a pattern (task-packet.md); the
layer references say HOW the chosen one is written.

## Placement
| Situation | Action |
|---|---|
| New code calls INTO the core (HTTP, CLI, event listener, e2e test) | driving adapter -> `interface/` |
| The core calls OUT to it (DB, external API, clock, id generator) | driven adapter -> `infrastructure/` |
| Unsure whether it is "presentation" or "infrastructure" | Wrong question: ask only whether it calls in or is called out to. Both are peers |
| A port method name reads like a technology (`insertRow`, `httpPost`) | Rename it in business language; the adapter translates underneath |
| The core needs an `if` on which adapter is active | Stop: the port leaks. Fix the port, not the core |

## Domain
| Situation | Action |
|---|---|
| The rule depends only on the object's own fields | VO constructor or entity validation -> `InvalidValueObjectException` |
| The rule depends on aggregate state or a transition | Aggregate method -> `BusinessRuleViolationException` |
| A precondition needs data the aggregate cannot see (uniqueness, existence) | Application, before calling the aggregate |
| `findById` returned null | The use case throws `NotFoundException`. Never the repository, never an entity |
| A concept carries a rule, a unit or a meaning beyond a bare primitive | VO, including compound records and method-parameter shapes |
| A string-literal union with nothing validating the fields around it | Still primitive obsession: VO |
| Logic must change two aggregates | One save, then a domain event; a subscriber handles the second. Never two saves |
| A swappable rule (category, pricing, eligibility) | Abstract class in `domain/`, default implementation chosen in the composition root |
| Logic spans aggregates and belongs to none | Domain service: stateless, no port access; application loads and passes the data in |
| It is a CRUD wrapper, or a `*Service` holding one aggregate's rules | Not a domain service: that behavior belongs on the aggregate |

## Application
| Situation | Action |
|---|---|
| The lookup matches the aggregate's own shape | Repository port. No query service |
| The read shape diverges (filters, joins, projections, pagination) | Query service port -> read-model DTO, never an aggregate |
| A listing | `Criteria` built at the entry point (page 1, pageSize 20, max 100), resolved by a query service returning summaries |
| Logic shared by two use cases | Domain, a policy, or an event. A use case never calls another use case |
| Another module's data is needed | Abstract port in `application/ports/` + adapter in `infrastructure/` calling that module's use case |
| Another context's data is needed | `shared/integration-queries/` lookup + local port + anti-corruption adapter |
| Another context must react to a fact | Integration event after the save: versioned, primitives only |
| A reaction must not run twice | Idempotent by business key, never by `eventId` |
| An `if` on domain state appears in the use case | It belongs on the aggregate |

## Infrastructure and interface
| Situation | Action |
|---|---|
| An adapter needs an `if` on business meaning, not just shape | Stop: that decision is domain or application |
| A controller must shape a response out of an aggregate | Wrong layer: application already returns the summary shaped |
| A new error needs its own HTTP status | New domain exception subclass mapped in the ONE global filter. Never a second filter |
| Auth, roles, rate limiting | Guard at the composition root. Technical decisions only, never business rules |
| A second orchestration style (command bus beside plain `run()`) | Pick one for the whole codebase, or keep `run()` |
