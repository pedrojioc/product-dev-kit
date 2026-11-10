# Rationale: what has authority, and what is ours

Read this before CHANGING a rule, to know whether you are overriding a primary source or
overriding yourself. Never shipped in a task packet.

Provenance: the citations below were verified in the `hexagonal-architect` lab repo
(`~/Projects/Lab/hexagonal-architect`), which holds the full per-rule sourcing. They are
reproduced here, not independently re-verified. That repo is the place to extend them.

## Sourced
| Rule here | Authority |
|---|---|
| Ports named in the core's business language; the adapter translates | Cockburn, *Hexagonal Architecture* (2005): "for each external device there is an adapter that converts the API definition to the signals needed by that device" |
| Driving and driven adapters are peers; `interface/` is not lesser | Cockburn: "the asymmetry to exploit is not that between left and right sides of the application but between inside and outside" |
| The core imports no adapter, framework or ORM | Cockburn: "code pertaining to the inside part should not leak into the outside part" |
| The core must run against a swapped adapter with zero core edits | Cockburn on headless deployment + FIT for primary actors, mocks for secondary ones |
| An e2e test is itself a driving adapter | Cockburn: "the natural test adapter to substitute for a primary actor is FIT" |
| VOs immutable, compared by value | Fowler, *ValueObject* |
| No code path may build an invalid instance | MS Learn, domain-model-layer validations; *Always-Valid Domain Model* |
| No public setters; behavior enforces invariants | Fowler, *AnemicDomainModel*: entities as "bags of getters and setters" is the anti-pattern |
| One aggregate per transaction; cross-aggregate effects via events | Evans, *DDD*; Vernon, *IDDD* |
| Domain events are handled in the application layer, not the domain | MS Learn, domain-events design and implementation |
| Domain event -> integration event, published after the save commits | Cesar de la Torre (Microsoft), *Domain Events vs. Integration Events* |
| An event leaving the context is a stable published contract | Vernon, *IDDD*: Published Language |
| Translate a foreign payload at the boundary | Hohpe & Woolf, *EIP* (2003): Message Translator |
| Query service only when the read shape diverges | Fowler, *CQRS* ("be very cautious... for most systems CQRS adds risky complexity"); Azure Architecture Center names separate models in one store "the foundational level of CQRS" |
| Cross-context reads go through a translating adapter | Evans, strategic design: Anticorruption Layer, Open Host Service |
| Adapters bound to ports only in the composition root | MS Learn: "no direct instantiation of or static calls to the Infrastructure layer types" outside it |
| Port is an `abstract class`, never `interface` + `Symbol` | NestJS custom-providers docs: abstract classes exist at runtime and need no `@Inject()`; types are erased |

## Ours, with no canonical source
Change these freely; no author is contradicted. They are conventions because they are
decided, not because they are canon.

- The `domain/` + `application/` split inside the core. Cockburn mandates no internal layer
  count: "there may be more than two ports to the application."
- `interface/` as the driving-adapter folder name, and module = one aggregate root, package
  by feature under `contexts/<ctx>/<module>/`.
- The three-exception taxonomy and its 400 / 404 / 422 mapping, with `NotFoundException`
  thrown only by the application layer while the repository returns `T | null`.
- In-place mutation only: private constructor, named static factory, `restore()` reserved
  for the repository, no events and no transition checks on restore.
- UUID v7 only, generated server-side by the `IdGenerator` port.
- VO files as flat siblings of their aggregate; no per-aggregate `value-objects/` folder.
- Integration event envelope `{ eventId, name, version, occurredAt, payload }`, numeric
  `version` with no `.v1` in names, subscribers idempotent by business key never `eventId`.
- `shared/integration-queries/` as the cross-context read mechanism.
- Tests in a top-level `tests/` mirroring `src/`, one spec per production file, never beside code.
- `Criteria` defaults: page 1, pageSize 20, max 100.
- No barrel files; relative imports with an explicit `.js` (NodeNext ESM).
- Append-only history: recorded facts are immutable.
- The suffix set: `.exception.ts`, `.event.ts`, `.adapter.ts`, `.listener.ts`, `.module.ts`,
  `.mapper.ts`, `.spec.ts`, and nothing else.

## Where we diverge from the lab repo on purpose
| Topic | Lab | Here |
|---|---|---|
| Nest decorators on core classes | allows `@Injectable()`/`@Controller()`: read only at bootstrap, no behavior added | forbids every `@nestjs/*` import in the core; use cases are registered with `useFactory`, so they never need one. Ours stays enforceable by grep |
| Who throws `NotFoundException` | the adapter or the use case | the repository returns `T \| null`; only the use case throws |
| VO file placement | implies a per-aggregate subfolder | module = one aggregate, so `domain/` is already flat |
| Cross-context mechanism | none needed: another context is just a port + adapter | versioned `shared/integration-events/` + `integration-queries/` |
