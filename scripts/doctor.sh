#!/usr/bin/env bash
# pdk doctor: check that every requirement for the pdk workflow is in place.
# Usage: doctor.sh [project-dir]   (defaults to the current directory)
set -uo pipefail

PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT="${1:-$PWD}"
cd "$PROJECT" || { echo "pdk doctor: cannot enter $PROJECT"; exit 2; }

fails=0
warns=0

ok()   { printf '[OK]   %-22s %s\n' "$1" "$2"; }
warn() { printf '[WARN] %-22s %s\n' "$1" "$2"; warns=$((warns + 1)); }
fail() { printf '[FAIL] %-22s %s\n       fix: %s\n' "$1" "$2" "$3"; fails=$((fails + 1)); }

printf 'pdk doctor — %s\n\n' "$PROJECT"

# 1. codegraph binary
if command -v codegraph >/dev/null 2>&1; then
  ok "codegraph binary" "$(codegraph --version 2>&1 | head -1) ($(command -v codegraph))"
else
  fail "codegraph binary" "not on PATH" "install codegraph and reopen the shell"
fi

# 2. codegraph MCP server, declared globally (never shipped by this plugin)
python3 - "$PROJECT" <<'PY'
import json, os, sys
project = sys.argv[1]
home = os.path.expanduser('~')
found = []
path = os.path.join(home, '.claude.json')
try:
    with open(path) as fh:
        d = json.load(fh)
    if 'codegraph' in (d.get('mcpServers') or {}):
        found.append('~/.claude.json (user scope)')
    proj = (d.get('projects') or {}).get(project) or {}
    if 'codegraph' in (proj.get('mcpServers') or {}):
        found.append('~/.claude.json project entry')
except (OSError, ValueError):
    pass
for rel, label in (('.mcp.json', 'project .mcp.json'),):
    try:
        with open(os.path.join(project, rel)) as fh:
            if 'codegraph' in (json.load(fh).get('mcpServers') or {}):
                found.append(label)
    except (OSError, ValueError):
        pass
if found:
    print('[OK]   %-22s %s' % ('codegraph MCP', 'configured in ' + ', '.join(found)))
else:
    print('[FAIL] %-22s %s\n       fix: %s' % (
        'codegraph MCP', 'no codegraph server in your MCP config',
        'claude mcp add codegraph --scope user -- codegraph serve --mcp'))
    sys.exit(1)
PY
[ $? -ne 0 ] && fails=$((fails + 1))

# 3. codegraph index for this repo
if [ -d .codegraph ]; then
  files=$(codegraph status 2>/dev/null | sed 's/\x1b\[[0-9;]*m//g' | awk '/^ *Files:/ {print $2; exit}')
  if [ -n "${files:-}" ] && [ "$files" != "0" ]; then
    ok "codegraph index" "$files files indexed"
  else
    warn "codegraph index" ".codegraph/ exists but reports no files; run: codegraph index"
  fi
else
  fail "codegraph index" "no .codegraph/ in this repo" "codegraph init"
fi

# 4. git repository (the Tech Lead branches per issue)
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  if [ -z "$(git status --porcelain)" ]; then
    ok "git repository" "branch $branch, clean tree"
  else
    warn "git repository" "branch $branch, uncommitted changes (implement stops on a dirty tree)"
  fi
else
  fail "git repository" "not a git repository" "git init, or run pdk from the repo root"
fi

# 5. project conventions
conv="docs/engineering/CONVENTIONS.md"
if [ -f "$conv" ]; then
  left=$(grep -o '{[A-Za-z][^}]*}' "$conv" | sort -u | tr '\n' ' ')
  if [ -n "$left" ]; then
    warn "CONVENTIONS.md" "placeholders still unfilled: $left"
  else
    ok "CONVENTIONS.md" "present and filled in"
  fi
else
  fail "CONVENTIONS.md" "$conv missing" "mkdir -p docs/engineering && cp \"$PLUGIN_ROOT/templates/CONVENTIONS.md\" $conv"
fi

# 6. product source of truth (only the PM flows need it)
if [ -f docs/product/INDEX.md ]; then
  ok "product docs" "docs/product/INDEX.md present"
else
  warn "product docs" "docs/product/INDEX.md missing; run /pdk:product-init before /pdk:req-create"
fi

# 7. where pdk is enabled from
python3 - "$PROJECT" <<'PY'
import json, os, sys
project = sys.argv[1]
scopes = []
for path, label in (
    (os.path.join(project, '.claude/settings.local.json'), 'local'),
    (os.path.join(project, '.claude/settings.json'), 'project'),
    (os.path.expanduser('~/.claude/settings.json'), 'user (global)'),
):
    try:
        with open(path) as fh:
            plugins = json.load(fh).get('enabledPlugins') or {}
    except (OSError, ValueError):
        continue
    for key, enabled in plugins.items():
        if key.split('@')[0] == 'pdk' and enabled:
            scopes.append(label)
if not scopes:
    print('[WARN] %-22s %s' % ('pdk scope', 'no enabled pdk entry found in this project or user settings'))
    sys.exit(1)
note = '' if scopes[:1] != ['user (global)'] else ' — install it per project instead'
print('[OK]   %-22s %s%s' % ('pdk scope', ', '.join(scopes), note))
PY
[ $? -ne 0 ] && warns=$((warns + 1))

printf '\n%d failed, %d warnings\n' "$fails" "$warns"
[ "$fails" -gt 0 ] && exit 1
exit 0
