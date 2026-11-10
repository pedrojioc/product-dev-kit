# Task packet

The only context an implementer gets. The Tech Lead writes one per work unit,
self-contained and minimal. Worked example: `task-packet-example.md`.

## Rules
- Implementer must NOT read the full issue (tracker or `docs/work/`) or `docs/product`. If the packet is insufficient, return a doubt (see when-in-doubt).
- `Required reading` carries the HOW, as absolute paths and never as transcribed text: the project's `CONVENTIONS.md`, the layer references this unit touches, and the nearest existing file to mirror. The implementer reads all of it before the first test.
- `Conventions excerpt` is NOT the transport for conventions any more. It holds only this unit's deviations plus the 3-5 rules most often broken here. Do not retype what `Required reading` already points at.
- Precedence, restated in every packet: this packet's signatures > project `CONVENTIONS.md` > the generic references.
- Allowed files list production paths and the mirrored test path (`tests/` mirrors `src/`, file name + `.spec.ts`).
- Implementer touches only "Allowed files" and follows "Tests to write first" in strict TDD order.
- One packet = one work unit = one commit (see git-workflow). A unit may span layers; list every layer's reference in `Required reading` when it does.

## Format
```
# Task packet: <ABC-12> / <unit name>
## Objective
<1-3 sentences: the behavior to deliver and why it is bounded this way>
## Acceptance criteria covered
<verbatim Gherkin scenarios from the issue; no paraphrase>
## Required reading (all of it, before the first test)
Project: <abs path to docs/engineering/CONVENTIONS.md>
Layers: <abs paths of the references for every layer this unit touches>
Mirror: <abs path of the closest existing file> - <the 3-5 rules it follows>
Precedence: this packet's signatures > project CONVENTIONS.md > references.
These say HOW to write what this packet names. They never authorize adding what it does not name.
## Allowed files
Create: <paths>
Modify: <paths>
Nothing else.
## Interfaces and signatures already decided
<ports, class names, method signatures, input and summary types, error types, event shapes>
## Tests to write first
<ordered list: file, test name, what it asserts; red before green>
## Conventions excerpt (deviations only)
<this unit's deviations, plus the 3-5 rules most often broken here>
## Done when
<checklist: tests pass, lint/typecheck pass, only allowed files changed, commit made>
## Response format (max 15 lines)
Files changed: <list>
Tests added + result: <names, pass/fail>
Doubts: <none | numbered questions>
```
