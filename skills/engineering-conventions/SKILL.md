---
name: engineering-conventions
description: Generic hexagonal/DDD/SOLID/TDD conventions and the task packet format. Read the references you need.
disable-model-invocation: true
---

Generic defaults. The project's `docs/engineering/CONVENTIONS.md` overrides anything here.
Read only the references your situation needs.

| Situation | Read |
|---|---|
| Deciding layers, folders, dependency direction, ports/adapters | `${CLAUDE_SKILL_DIR}/references/hexagonal.md` |
| Modeling aggregates, entities, value objects, domain events | `${CLAUDE_SKILL_DIR}/references/domain-design.md` |
| Designing or implementing a use case, DTOs, criteria/pagination, errors, transactions | `${CLAUDE_SKILL_DIR}/references/use-cases.md` |
| Reviewing design smells, choosing abstractions, style and lint | `${CLAUDE_SKILL_DIR}/references/solid.md` |
| Writing or planning tests, TDD loop, mocks, mothers, e2e | `${CLAUDE_SKILL_DIR}/references/testing.md` |
| NestJS/TypeORM: module wiring, DI tokens, controllers, DTO validation, persistence, migrations | `${CLAUDE_SKILL_DIR}/references/nestjs.md` |
| Branches, commits, PR hygiene | `${CLAUDE_SKILL_DIR}/references/git-workflow.md` |
| Any doubt: product, technical, or scope | `${CLAUDE_SKILL_DIR}/references/when-in-doubt.md` |
| Tech Lead delegating work to an implementer | `${CLAUDE_SKILL_DIR}/references/task-packet.md` |

Tech Lead: excerpt only the relevant lines of these references into each task packet.
Implementers receive packets, not this skill.
