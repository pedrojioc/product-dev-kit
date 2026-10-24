# Domain design

## Aggregate
- Consistency boundary: inside changes atomically; outside is eventually consistent. One root; outsiders hold only the root and reference other aggregates by id.
- Size small. A child entity goes INSIDE only if all hold: it cannot exist without the root, it must be consistent immediately, it is loaded with the root, it has little rules of its own. Otherwise it is its own aggregate referenced by id.
- Child entities do not extend `AggregateRoot` and have no repository; the root's repository persists them (`order.items`, `level.movements`). Never keep child ids in the root when the child lives inside.
- Signals to split: rarely used data loaded on every write, unrelated actors editing concurrently, unbounded collections, a 700+ line root.
- One use case saves exactly one aggregate. Effects on a second aggregate run in a subscriber reacting to an event, never two saves in one use case.
- Behavior lives on the aggregate (`order.addItems()`), not in services. Methods enforce invariants, record events, expose no public setters.
- Shape: `static create(...primitives)` validates and records the creation event; `static fromPrimitives(p)` rehydrates without events; `toPrimitives()` exports. Export `<Aggregate>Primitives` next to the class. Constructor private; fields are VOs.

## Value object
- Immutable, compared by value, validates in the constructor, throws `InvalidValueObjectException`. An invalid VO cannot exist.
- Wrap every concept with a rule or meaning: ids, names, money, quantity, email, status. No bare primitives in aggregates.
- File is flat in `domain/` beside the aggregate: `product-name.ts` -> `ProductName extends StringValueObject`. No `value-objects/` folder, no `.vo.ts`. Ids: `ProductId extends Uuid`.
- Multi-part values (`Money` amount+currency, `Quantity`) return new instances from operations and reject mixed currency/unit.
- Optional concept: nullable field of VO type; `toPrimitives` gives `?.value ?? null`.

## Invariants and errors
- Rule on the object's own data: VO/entity throws `InvalidValueObjectException` (HTTP 400).
- Rule on state or policy (status transition, stock): aggregate method throws `BusinessRuleViolationException` (422).
- Missing record: `NotFoundException` (404), thrown by the Find use case, never by an entity about itself.
- All extend one `DomainException`; never plain `Error`, never framework/HTTP errors in domain. Name for the violated rule (`OrderNotReadyToClose`), message carries the value. File `<name>.exception.ts` in `domain/exceptions/`.
- Rules needing outside data (uniqueness) are checked in the use case via a repository port.

## Domain services
- Only for a business operation spanning aggregates that belongs to none, reused or complex enough to test alone (FIFO costing, SKU generation). A single-use rule stays in the use case.
- Stateless pure class in `domain/services/<name>.service.ts`, no decorators, no repository or infrastructure access. Application loads the aggregates and passes them in.
- Not a domain service: CRUD wrappers, `*Service` god classes, anything calling email/payment/DB (use case or adapter).

## Domain events
- Past tense, one per business fact, specific over generic (`OrderItemCancelled`, not `OrderUpdated`). File `<name>.event.ts` in `domain/events/`.
- Extends `DomainEvent`: static `EVENT_NAME = '<aggregate>.<past-verb>'`, `VERSION`, payload of primitives, `toPrimitives()` and `fromPrimitives()` for storage. Raised by the root via `this.record(...)`.
- Use case saves, then publishes `aggregate.pullDomainEvents()`.
- Subscribers live in `application/subscribers/`, named Action+On+Event (`ReleaseTableOnOrderClosed`), idempotent, one reaction each, reaching other aggregates/contexts through ports.
- Classify every subscriber: synchronous (must be atomic with the trigger; runs in the same transaction; failure rolls back) or deferred (external, slow, tolerates delay; outbox, at-least-once, retried). Default deferred.
- Foreign events: translate payload into local types on receipt. If an event exposes VOs or changes often, the owner publishes a dedicated integration event.

## Read models
- Reads shaped unlike the aggregate use a query service returning DTOs (see hexagonal), not the aggregate.

```ts
class Order extends AggregateRoot {
  static create(id: string, type: OrderType): Order {
    const order = Order.fromPrimitives({ id, type, status: OrderStatus.OPEN, items: [] })
    order.record(new OrderOpenedEvent({ orderId: id }))
    return order
  }
  addItems(inputs: AddItemInput[]): void {
    if (!this.canBeModified()) throw new OrderCannotBeModified(this.status)
    // ...mutate, then this.record(new OrderItemsAddedEvent(...))
  }
}
```
