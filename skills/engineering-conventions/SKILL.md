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

Tech Lead: excerpt only the relevant lines of these references into each task packet.
Implementers receive packets, not this skill.
