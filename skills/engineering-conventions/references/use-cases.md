# Use cases

## Anatomy
- One use case = one plain class = one file = one public method `run()`. File `register-animal.ts` in `application/`, class `RegisterAnimal` (verb + entity, no suffix). Never `execute()`/`handle()` (`handle()` is for subscribers only).
- No decorators or framework types. Constructor takes ports only (`private readonly animals: AnimalRepository, ids: IdGenerator, clock: Clock, publisher: IntegrationEventPublisher`); use `import type` for ports used only as types.
- Input: ONE `<UseCase>Input` interface (exported next to the class) of primitives, `Date`, domain string-literal types and plain nested objects. A lone id is a positional `string`. Never VOs, aggregates or framework request objects.
- No command/query bus, `CommandHandler` triads or `ApplicationException` base. A bus is added only for several entry points or async execution, then for all contexts.
- One use case never calls another use case; shared logic goes in the domain, a policy, or an event.

## Flow
1. Receive the input. 2. Build VOs (they validate) and load the aggregate; absent -> throw `NotFoundException` here.
3. Check preconditions needing data (uniqueness, existence, cross-context lookup) via repository or port; throw `BusinessRuleViolationException`.
4. Call the aggregate's behavior method or static factory; ids come from `IdGenerator` (server-side; a client id only with a documented reason), instants from `Clock`.
5. `save` through exactly one repository. 6. Publish AFTER the save succeeds (failed save publishes nothing).
7. Return the summary (see data-flow.md).
No business rule here beyond orchestration: an `if` on domain state moves into the aggregate. Do not re-check what a VO or aggregate already enforces.

## Events out
- After `save`, `female.pullDomainEvents()`; for each domain event the use case builds an integration event with `application/integration/<event>.mapper.ts` (pure function, new `eventId` from `IdGenerator`) and calls `IntegrationEventPublisher.publish`.
- Domain events that no other module needs publish nothing.

## Subscribers (react to another module's event)
- `application/subscribers/<action>-on-<event>.ts`, class `<Action>On<Event>` with `handle(event: AnyIntegrationEvent)`. Ignore unknown `name`/`version`; narrow the payload; translate ISO strings to local types immediately.
- Idempotent by business key: look up by key first, no-op if already applied. One reaction each; reach other modules only through ports.
- `interface/events/<event>.listener.ts` is the driving adapter: subscribes the handler to the bus in `onModuleInit`.

## Queries and lists
- Lookups matching the aggregate use the repository. Reads shaped differently (filters, joins, pagination) use a query-service port returning read-model DTOs, never aggregates.
- Listings take a `Criteria` (filters, order, `page` default 1, `pageSize` default 20, max 100) built at the entry point from the request DTO and resolved by a query service/port that returns `*Summary` read models, never aggregates.

## Errors
- Use cases throw the three shared exceptions (domain-design.md) with a message naming the value; no error codes, no null for failures, no HTTP knowledge. `application/exceptions/` only for typed checks needing orchestration context, extending the same hierarchy.
- Repository `findById` returns `T | null`; the use case turns null into `NotFoundException`.

## Transactions
One aggregate saved atomically per `run()`. Cross-aggregate effects are subscribers. Events publish after the save, in-process. Outbox: not used while saving+publishing in-process is acceptable. Introduce a transactional outbox when real persistence arrives and losing an event becomes unacceptable.

```ts
export class RecordAnimalExit {
  constructor(private readonly animals: AnimalRepository) {}

  async run(input: RecordAnimalExitInput): Promise<AnimalSummary> {
    const animal = await this.animals.findById(new AnimalId(input.animalId))
    if (!animal) throw new NotFoundException(`Animal ${input.animalId} not found`)
    animal.exit(input.reason, input.occurredOn)
    await this.animals.save(animal)
    return toAnimalSummary(animal)
  }
}
```
