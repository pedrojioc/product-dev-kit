# Use cases

## Anatomy
- One use case = one plain class = one file = one public method `run()`. Never `execute()`/`handle()` (those belong to framework handlers).
- Name: verb + entity, no suffix: `CreateProduct`, `FindProduct`, `SearchProductsByCriteria`. File `create-product.ts` in `application/create/`.
- No framework decorators or types. Constructor receives ports and repositories only (repository, `EventBus`, cross-context ports).
- No command/query bus or `CommandHandler` triads: a single datastore and one entry point (HTTP) get no benefit. Add a bus only for several entry points, middleware, or async execution, and then for all contexts, not some.
- Calling another use case: only your own module's `Find<Aggregate>` to load-or-throw. Cross-context logic goes through a port; shared logic through a domain service or an event.

## Flow
1. Receive primitives. 2. Load or create the aggregate through its behavior method (VOs validate on construction).
3. Check preconditions needing data (exists / not exists) via a repository or port.
4. Save through exactly one repository. 5. Publish `aggregate.pullDomainEvents()` after the save. 6. Return per the rules below.
No business rule here beyond orchestration: an `if` on domain state moves into the aggregate. Do not re-check what the domain already enforces.

## Input
- Positional primitives (string, number, boolean, Date, null) or domain enums; a small plain object when many optionals. The use case builds VOs; the caller never passes VOs or framework request objects.
- Ids of user-created resources come from the client (UUID in the request body); the backend never generates them. Server-side generation only for sequences and numbers (`repository.nextOrderNumber(date)`), which may keep their own transaction.
- Rejected alternative: handler converts to VOs before the use case.

## Output
- Commands return `void`, or a server-generated value the client cannot know (order number).
- Queries return a Response DTO from `application/dto/<name>.response.ts` with a static factory (`fromAggregate`). Never the raw aggregate or ORM entity across to presentation. `Find<Aggregate>` is the internal load-or-throw returning the aggregate for sibling use cases; an endpoint-facing query returns the DTO, so the controller never maps aggregates (older modules do `Response.fromDomain(await find.run(id))` in the controller; do not copy).
- Lists: `Search<Plural>ByCriteria.run(criteria)` delegates to the query service and returns `PaginatedResult<ListItem>` where `ListItem` is a plain read-model interface.

## Criteria and pagination
- One list endpoint per resource, always paginated: `page` (default 1), `pageSize` (default 20, max 100). The domain word is `pageSize`, never `limit`.
- `Criteria` = `Filters` + `Order` + `Pagination` in shared domain; presentation builds it, infrastructure translates it to SQL.
- Use it for collections that can pass ~100 rows or need dynamic filters/sort. Small catalogs may use `searchAll()` on the repository.

## Errors
- Throw typed domain exceptions (`IngredientNotExist`); no error codes, no null for failures. Use cases never translate to HTTP; one filter maps exception type -> status.
- `search`: repository returns `T | null`. The `Find` use case turns null into a `NotFoundException` subclass.
- Checks needing orchestration context (loaded settings) go in `application/exceptions/` extending the same domain hierarchy. No separate application error base.

## Transaction boundary
- One aggregate saved atomically per `run()`. Cross-aggregate effects are subscribers.
- The transaction is opened outside the use case (interceptor/wrapper at the entry point); use cases stay unaware and call `save` as usual.
- Publish events after a successful save.

## Repository method names
`save` (upsert), `search(id): T | null`, `searchAll(): T[]`, plus intent-named queries. Repositories return aggregates, never rows.

```ts
export class RenameCourse {
  constructor(
    private readonly repository: CourseRepository,
    private readonly eventBus: EventBus,
    private readonly findCourse: FindCourse
  ) {}

  async run(id: string, name: string): Promise<void> {
    const course = await this.findCourse.run(id)
    course.rename(name)
    await this.repository.save(course)
    await this.eventBus.publish(course.pullDomainEvents())
  }
}
```
