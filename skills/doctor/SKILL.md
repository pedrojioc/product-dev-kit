---
name: doctor
description: Check that every requirement for the pdk workflow is installed and configured in this project.
disable-model-invocation: true
model: haiku
effort: low
allowed-tools: Bash, ToolSearch, mcp__plugin_pdk_linear__list_teams
---

Reply to the owner in their language.

## Process
1. Run `"${CLAUDE_PLUGIN_ROOT}/scripts/doctor.sh" "${CLAUDE_PROJECT_DIR}"` and print its output verbatim.
2. Check Linear, which the script cannot: call `list_teams` (load it with ToolSearch, query "linear", if it is not callable). Add one line to the report:
   - `[OK]   linear MCP             authenticated, N teams` on success.
   - `[FAIL] linear MCP             not authenticated` plus `fix: run /mcp and log in to linear` on failure.
3. If anything failed, list only the fix commands, in order. If everything passed, say so in one line.

## Rules
- Do not fix anything yourself: report and let the owner run the commands.
- Add no commentary beyond the report and the fixes.
