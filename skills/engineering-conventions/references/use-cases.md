# Use cases

## Anatomy
- One use case = one class = one file = one public method (`run()` by default, or a single verb like `register()`).
- Name the class for the action, as a noun-agent or verb phrase: `CourseCreator`, `UserEmailUpdater`, `CreateCourse`. Do not suffix `UseCase`/`Service`. Match the project's existing choice.
- Constructor receives ports only (repository, event bus, clock, id generator). No framework types, no other use cases.
- Folder per feature: `application/create/`, `application/rename/`, each with the use case and its input/output types.

## Flow
1. Receive primitives (or a plain command DTO). 2. Build value objects (validation for free).
3. Check preconditions needing data (exists / does not exist) via a repository port.
4. Load or create the aggregate and call its behavior method.
5. Save through exactly one repository.
6. Publish `aggregate.pullDomainEvents()` after the save.
7. Return a response DTO or nothing.
No business rule here beyond orchestration; if you write an `if` about domain state, move it to the aggregate.

## Input and output
- Input: primitives or a flat command object. Never a framework request, never domain objects built by the caller.
- Commands return `void` (or the new id when the client cannot generate it). Prefer client-generated ids.
- Queries return a response DTO with a static `fromAggregate(...)`; never the raw aggregate or ORM entity.
- Request DTOs and schema validation (shape, types, required) belong to the interface layer; domain rules belong to VOs.

## Errors
- Throw typed domain errors (`CourseDoesNotExist`, `UserAlreadyExist`). Do not return error codes or null for failures.
- Use case never catches an error to translate it into HTTP; the interface layer maps error type -> status (404, 409, 422).
- Application-only checks (needs loaded data) go in `application/errors/` extending the same domain error base.
- Not found on load: throw. Existence probes: repository returns `T | null`, use case decides.

## Transaction boundary
- The use case is the transaction boundary: one aggregate saved atomically per run.
- Cross-aggregate effects happen through domain events in separate transactions (eventual consistency).
- Publish events after a successful save; subscribers must be idempotent.
- Never call a use case from another use case; share logic via a domain service or an event.

## Repository usage
- Methods named in business terms: `save`, `search` (may return null), `find` (throws if absent), `searchAll`.
- Repository returns aggregates, not rows. Mapping happens inside the adapter.

```ts
class CourseRenamer {
  constructor(private readonly repository: CourseRepository, private readonly eventBus: EventBus) {}
  async run(id: string, name: string): Promise<void> {
    const course = await this.repository.find(new CourseId(id));
    course.rename(name);
    await this.repository.save(course);
    await this.eventBus.publish(course.pullDomainEvents());
  }
}
```
