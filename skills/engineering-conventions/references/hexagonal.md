# Hexagonal architecture

## Layers
```
src/<bounded-context>/<module>/
  domain/          aggregates, entities, value objects, domain events, domain errors, repository ports
  application/     use cases, ports to external capabilities, event subscribers, response DTOs
  infrastructure/  driven adapters: repositories, API clients, clock, id generator, event bus
  interface/       driving adapters: HTTP controllers, CLI, consumers, request validation
composition root   the only place that wires adapters to ports (DI module / main)
```
"interface/" may be named "presentation/" or "http/"; keep one name per project.

## Dependency rule
- interface -> application -> domain. infrastructure -> application/domain (implements ports).
- domain imports nothing outside domain (no framework, ORM, SDK, HTTP, env).
- application imports domain only. Never an adapter, framework or ORM type.
- Adapters never import each other. Modules never import another module's domain/application: call it through a port in the caller's `application/ports/`, implemented by a driven adapter.

## Ports and adapters
- A port is an interface (or abstract class) owned by the core, named in business language: `CourseRepository.save(course)`, not `insertRow`.
- Driving adapter (calls in) and driven adapter (called out) get equal rigor; they differ only in direction.
- Repository port lives in `domain/`; one repository per aggregate root.
- Non-persistence ports (mailer, payment, clock, uuid generator) live in `application/ports/`.
- The core must run unchanged against a swapped adapter (in-memory vs Postgres). If a core edit is needed for one adapter, the port leaks: fix the port.
- Never branch core code on which adapter is active.

## Where code lives
| Code | Location |
|---|---|
| Business rule, invariant | domain (aggregate or value object) |
| Orchestration: load, call, save, publish | application use case |
| Read shape that differs from any aggregate | query service port in application, implemented in infrastructure |
| SQL, ORM entities, mappers to/from aggregate | infrastructure |
| Request parsing and validation, status codes, serialization | interface |
| Env/config reading | composition root, injected as plain values |

## Naming and structure
- Files in PascalCase named after the class (`CourseCreator.ts`) unless the project says kebab-case.
- Group by feature/module first, then by layer. Never a global `controllers/`, `services/` folder.
- Repository adapters are named for the technology: `PostgresCourseRepository`, `InMemoryCourseRepository`.
- Wiring happens through constructor injection; no service locators, no static singletons.

## Anti-patterns
- Anemic domain: entities with only getters/setters and logic in services.
- Controller containing business rules or talking to the repository.
- ORM entity used as the domain aggregate.
- Use case returning the raw aggregate to the interface layer.
