#!/usr/bin/env bash
set -eu
here="$(dirname "$0")"
cp -R "$here/files/." .
git init -q . 2>/dev/null || true
git add -A >/dev/null 2>&1 || true
git -c user.email=eval@example.com -c user.name=eval \
  commit -qm "chore: eval fixture" >/dev/null 2>&1 || true
# The gate lives behind the codegraph preflight, so the index has to exist for the
# run to reach it. A missing binary is reported, never worked around.
if command -v codegraph >/dev/null 2>&1; then
  codegraph init --index >/dev/null 2>&1 || echo "pdk eval: codegraph init failed"
else
  echo "pdk eval: codegraph not on PATH; /pdk:implement will stop at preflight"
fi
