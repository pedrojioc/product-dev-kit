# Module blueprint

WHAT units a module is cut into and in what order. Tech Lead, at design time.
`decision-gates.md` picks the patterns; this picks the units and their sequence.
A module is one aggregate root plus its child entities (hexagonal.md).

## Inventory of a finished module
| Layer | Always | Only once something needs it |
|---|---|---|
| `domain/` | aggregate root, its VOs as flat siblings, `<aggregate>-repository.ts` | domain events, policies, domain services |
| `application/` | `<verb>-<entity>.ts` use cases, `<entity>-summary.ts` | `ports/`, `subscribers/`, `integration/` mappers, `services/<x>-query.service.ts` |
| `infrastructure/` | `in-memory-<aggregate>-repository.ts` | `persistence/<tech>/`, `query-services/`, `<port>.adapter.ts` |
| `interface/` | - | `http/` controllers + request DTOs, `events/<event>.listener.ts` |
| module root | `<module>.module.ts` | - |
| `tests/` | one spec mirroring every production file | `integration/`, `e2e/` |

Nothing is created "just in case": a port exists only when a use case in the current step
needs it, a query service only when the read shape diverges, `shared/` only when a second
module reuses the concept verbatim.

## Unit order
Outside-in per use case (testing.md), then widen:
1. **Domain** - aggregate + its VOs + the events it records. Asserts: valid creation, each
   invalid input throws the typed exception, each behavior changes state and records.
2. **Application** - the use case + its summary, against fake ports. This is the step that
   DISCOVERS the ports; do not design them before it.
3. **Infrastructure** - the in-memory repository (or the real adapter) plus any port adapter
   step 2 discovered.
4. **Interface** - controller or listener + request DTO.
5. **Wiring** - `<module>.module.ts` + its module spec.

A second use case on the same aggregate restarts at step 2, not step 1.

## Natural cuts
| Piece | Verdict |
|---|---|
| A VO used only by the use case being built | same unit as that use case |
| A VO with its own rules reused by 2+ behaviors | its own domain unit |
| Use case + its summary + its integration mapper | one unit |
| Controller + its request DTO | one unit |
| Repository adapter + its spec | one unit |
| Two use cases on one aggregate | one unit each |
| A reaction to another module's event | subscriber unit, then listener unit |

A unit spanning LAYERS is normal (a use case plus the VO it builds). A unit spanning
MODULES is not: that is a port plus an adapter, or two issues.

## Sequencing rules
- A unit may depend only on signatures an earlier unit of this issue already created, or on
  code that already exists. If it cannot, reorder; never let an implementer guess a signature.
- The first unit of a greenfield module carries the layout decision: name the context and the
  module in the ubiquitous language before writing any packet.
- `tests/architecture.spec.ts` and the shared kernel are project-wide, never inside a module unit.
