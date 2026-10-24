# Domain design

## Aggregate
- Consistency boundary: everything inside changes atomically; everything outside is eventually consistent.
- One root; outsiders hold and reference only the root. Reference other aggregates by id, never by object.
- Size small. Start with a single entity plus value objects. Add a child only if an invariant spans it AND must hold in a single transaction. If it can be stale for seconds, split it and react to an event.
- Signals to split: rarely used data loaded on every write, unrelated actors editing it concurrently, collections that grow unbounded.
- One use case saves exactly one aggregate. A second aggregate changes in a subscriber reacting to an event.
- Behavior lives on the aggregate (`course.rename(name)`), not in services that mutate it. A domain service is allowed only for logic spanning aggregates that belongs to none.
- Creation through a named constructor `Course.create(...)` that validates and records the creation event. Rehydration through `Course.fromPrimitives(...)` (no events). Export with `toPrimitives()`.

## Value object
- Immutable, compared by value, validates in its constructor, no identity. Throws on invalid input; an invalid VO cannot exist.
- Wrap every domain concept that has a rule or meaning: ids, names, emails, money, ranges, enums. Do not leave primitives in aggregates.
- Base classes: `StringValueObject`, `NumberValueObject`, `Uuid`, `Enum` with `equals()` and `value`.
- Optional concept: model absence explicitly (nullable field of VO type, or a null-object VO), never an empty string.
- Behavior goes in the VO (`money.add(other)`, `range.contains(x)`), returning a new instance.

## Entity
- Has identity (id VO) that never changes; equality by id. Mutates only through intention-revealing methods; no public setters.

## Invariants
- Enforce every invariant inside the aggregate or its VOs, at construction and at each mutation.
- Fail fast with a typed domain error (`InvalidArgumentError`, `CourseNameLengthExceeded`), message carrying the offending value.
- Rules needing outside data (uniqueness) are checked in the use case before creating, via a repository port.

## Domain events
- Past-tense, business-meaningful, one per fact: `CourseRenamed`, `UserEmailUpdated` (prefer specific over `UserUpdated`).
- Immutable; carry aggregate id, event id, occurredOn and only the changed data as primitives.
- The aggregate records events inside its behavior methods (`this.record(new CourseRenamed(...))`). The use case saves, then publishes `aggregate.pullDomainEvents()`.
- Subscribers live in application, are idempotent, and do one thing each. Consume a foreign event by translating the payload into local types immediately.
- Events leaving the module (integration events) are a stable, explicit contract; do not expose internal events as-is.

## Errors
- Domain errors extend one `DomainError` base, named for the violated rule: `CourseDoesNotExist`, `UserAlreadyExist`.
- Domain never throws framework or HTTP errors.

## Read models
- Reads whose shape differs from the aggregate use a projection or query service, not the aggregate. Keep them updated via domain events or a view.

```ts
class Course extends AggregateRoot {
  static create(id: string, name: string): Course {
    const course = Course.fromPrimitives({ id, name });
    course.record(new CourseCreated(id, name));
    return course;
  }
  rename(name: string): void { this.name = new CourseName(name); this.record(new CourseRenamed(this.id.value, name)); }
}
```
