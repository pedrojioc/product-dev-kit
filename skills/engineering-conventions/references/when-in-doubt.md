# When in doubt

Never guess. Pick the branch below and stop at the first that resolves the doubt.

## Product doubt (business rule, behavior, copy, edge case)
1. Check `docs/product` (module docs, glossary, decisions).
2. Still unclear: ask the owner via the product-ask flow. State the question, the options you see, and what is blocked.
3. Never invent a business rule, default, limit or wording. Wait for the answer; record it in `docs/product` through the normal flow.

## Technical doubt (structure, naming, library, pattern)
1. Project `docs/engineering/CONVENTIONS.md`.
2. These references.
3. Existing repo patterns: find the closest similar feature with codegraph (`codegraph_context`, then `codegraph_explore`) and mirror it. Never answer a structural question with a grep sweep.
4. Still open: propose exactly 2 options with tradeoffs (cost, risk, reversibility), recommend one, and ask the owner. Do not proceed on the open point until answered.

## Scope change
- Anything beyond the issue's acceptance criteria (extra feature, refactor of unrelated code, newly discovered bug): do not implement.
- Comment on the issue with what you found and suggest a new issue. Continue with the original scope.
- A change that makes a criterion impossible or contradictory is a product doubt: ask.

## Implementer subagents
- Never improvise: no new rules, files outside "Allowed files", signatures other than those given, or dependencies.
- On any doubt, stop that point, finish what is unambiguous, and return the doubt in the response format ("Doubts") to the Tech Lead.
- The Tech Lead resolves it via the branches above, then re-issues or amends the packet.
- A failing test that cannot be fixed within the allowed files is a doubt, not a license to widen scope.
