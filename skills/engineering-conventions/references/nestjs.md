# NestJS wiring

Framework mechanics for the layout in `hexagonal.md`. Core classes (domain, application) carry NO Nest decorators and import nothing from `@nestjs/*`. Decorators live only in `*.module.ts` and in `interface/` adapters.

## Module wiring (composition root)
- One `<module>.module.ts` per module is the only place that binds adapters to ports and builds use cases.
- Ports and adapters: `{ provide: AnimalRepository, useClass: InMemoryAnimalRepository }`; the abstract class is the token. No `@Inject()` and no `Symbol` tokens.
- Use cases are plain classes registered with `useFactory` + `inject`: `{ provide: RegisterAnimal, useFactory: (animals: AnimalRepository, ids: IdGenerator) => new RegisterAnimal(animals, ids), inject: [AnimalRepository, IdGenerator] }`. No `@Injectable()` on them.
- `exports` only what another module needs: a neutral lookup (`AnimalSummaryLookup`) or a use case. A cross-context lookup is provided as the shared abstract class, built from the owner's own use case.
- Project-wide providers (`Clock`, `IdGenerator`, `IntegrationEventPublisher`, the in-process event bus) live in one `@Global()` `SharedKernelModule`.
- A module never imports another context's module; it consumes the shared abstract class from the global provider. Module specs provide a fake of that lookup.

## Driving adapters (`interface/`)
- Controller or listener: thin. Parse and validate the wire shape, build the use case input, call exactly one `run()`/`handle()`, return the result unchanged. Constructor injects use cases only, never a repository, port or ORM client. Never imports a domain type (data-flow.md).
- Event listeners are plain classes implementing `OnModuleInit`, registered as providers by `useFactory`, subscribing a subscriber's `handle` to the in-process bus.
- Request validation belongs at the edge (a validation pipe or schema), never in the core; the core re-validates through VOs.
- ONE global exception filter maps `InvalidValueObjectException` 400, `NotFoundException` 404, `BusinessRuleViolationException` 422. No second filter. Auth and throttling are guards wired at the composition root, never business rules.
- Plural kebab-case routes; commands that create answer 201 with the summary.

## Event bus
- `IntegrationEventPublisher` is an abstract class in `shared/application/ports/`; the in-process bus implements it, awaits handlers sequentially, logs and swallows handler errors so a failed reaction never fails the publisher.
- Subscribers are keyed by event `name`; the bus delivers after the producing save. Swap for an outbox when a real database lands.

## Persistence (planned stack: Postgres + Drizzle)
- Until persistence lands, `infrastructure/in-memory-<aggregate>-repository.ts` is the adapter (also the test double). The Drizzle adapter replaces it with zero core change.
- Per module: `infrastructure/persistence/drizzle/` with `<table>.table.ts` (schema), `<aggregate>.mapper.ts` (explicit aggregate <-> row mapping) and `drizzle-<aggregate>.repository.ts`. Schema types never leave `infrastructure/`.
- Connection, migrations and seeders are project-wide in `src/shared/infrastructure/database/`. Migrations are generated and reviewed; never auto-sync the schema.
- Instants are `timestamptz`; ids are `uuid` columns. Invariants spanning rows (one open record per key) are also enforced by a DB constraint.

## ESM and scripts
`type: module`, `moduleResolution: NodeNext`: every relative import ends in `.js`. Scripts: `build` (tsc), `test`, `lint`. Run all three before committing: ts-jest does not type-check.
