---
name: engineering-conventions
description: Hexagonal/DDD/SOLID/TDD conventions (ports and adapters, layer data flow, testing, git) and the task packet format. Read the references you need.
disable-model-invocation: true
---

Generic defaults. The project's `docs/engineering/CONVENTIONS.md` overrides anything here.
Read only the references your situation needs.

| Situation | Read |
|---|---|
| Layers, folders, dependency direction, contexts, ports/adapters, naming | `${CLAUDE_SKILL_DIR}/references/hexagonal.md` |
| Aggregates, value objects, domain events, errors, policies | `${CLAUDE_SKILL_DIR}/references/domain-design.md` |
| Designing or implementing a use case, subscriber, input, events out | `${CLAUDE_SKILL_DIR}/references/use-cases.md` |
| What each layer receives/returns: request DTO, input, summary, mappers | `${CLAUDE_SKILL_DIR}/references/data-flow.md` |
| NestJS wiring, controllers/listeners, exception filter, persistence adapter | `${CLAUDE_SKILL_DIR}/references/nestjs.md` |
| Writing or planning tests, test folder layout, TDD loop, fakes, e2e | `${CLAUDE_SKILL_DIR}/references/testing.md` |
| Design smells, SOLID, style and lint | `${CLAUDE_SKILL_DIR}/references/solid.md` |
| Branches, commits, stacked PRs | `${CLAUDE_SKILL_DIR}/references/git-workflow.md` |
| Any doubt: product, technical, or scope | `${CLAUDE_SKILL_DIR}/references/when-in-doubt.md` |
| Tech Lead delegating work to an implementer | `${CLAUDE_SKILL_DIR}/references/task-packet.md` |
| WHICH pattern to reach for (design time, Tech Lead only) | `${CLAUDE_SKILL_DIR}/references/decision-gates.md` |
| WHAT units a module is cut into, and their order (Tech Lead only) | `${CLAUDE_SKILL_DIR}/references/module-blueprint.md` |
| Before CHANGING a rule: what has authority vs what is ours | `${CLAUDE_SKILL_DIR}/references/rationale.md` |

## By layer
These references are cut by topic, not by layer, so no single file is "the application
layer". A layer is complete only as this set:

| Layer | Complete set |
|---|---|
| domain | `domain-design.md` |
| application | `use-cases.md` + `data-flow.md` (summary, mappers) |
| infrastructure | `nestjs.md` (persistence, wiring) + `data-flow.md` (the row never leaves) |
| interface | `nestjs.md` (controllers, filter) + `data-flow.md` (request DTO -> input) |
| every layer | `hexagonal.md` (layout, dependency rule, ports, naming) + `testing.md` + `solid.md` |

Tech Lead: SELECT which of these each task packet needs and pass their absolute paths
under the packet's `Required reading`. Do not transcribe their content.
Implementers read the references their packet points at; they never read this index,
the Linear issue or `docs/product`.
