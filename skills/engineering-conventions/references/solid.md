# SOLID, style and lint

## S - Single Responsibility
One reason to change per module. Signal: class name needs "And"/"Manager"; a use case with unrelated collaborators.
Fix: one use case per file; rules move into the aggregate.

## O - Open/Closed
Add behavior by adding code. Signal: growing `switch` on a type. Fix: a policy abstract class (`CategoryPolicy`) with one implementation per variant, chosen in the composition root.

## L - Liskov
Any adapter works wherever its port is used. Signal: `instanceof` on a port; an in-memory fake behaving unlike the real adapter. Fix: tighten the port contract; run the same spec against every adapter.

## I - Interface Segregation
Ports are small role interfaces shaped by what a use case needs, never header interfaces mirroring a whole class. Split by consumer (`AnimalRepository` vs a query service vs a cross-context lookup).

## D - Dependency Inversion
Policy depends on abstractions it owns. Signal: ORM, SDK, `fetch`, `process.env`, `Date.now()`, `randomUUID()` or `new Adapter()` in domain/application. Fix: an abstract-class port in business language, injected by constructor, wired in the module.

## Companions
- Composition over inheritance; inherit only shared bases (`AggregateRoot`, `ValueObject`, port abstract classes).
- YAGNI: no abstraction beyond repository, query service, cross-context boundary and real variation points. Delete unused ports.
- Early returns and guard clauses; names reveal intent; tell, don't ask.
- Comments explain a non-obvious why (hidden constraint, workaround, invariant), never what the code says. Default to none.

## Style and lint (CI: build + lint + test)
- Prettier: semicolons, single quotes, trailing commas `all`, width 100.
- ESLint flat config: `eslint:recommended` + `typescript-eslint` recommended + `eslint-config-prettier`, run on `src/**/*.ts` and `tests/**/*.ts`.
- TypeScript `strict`, `module`/`moduleResolution` `NodeNext`, `isolatedModules`; `import type` for type-only imports.
- Relative imports ending in `.js`; no path aliases, no barrels.
- All code artifacts in English: identifiers, files, folders, messages, test names, DTO fields, columns, commits.
