#!/usr/bin/env bash
# Crea el repo en GitHub y sube el código. Requiere GitHub CLI (`gh`) con sesión
# iniciada (`gh auth login`). Uso: ./scripts/publish-github.sh [nombre-del-repo] [--public]
set -euo pipefail

REPO="${1:-guerrero-gym}"
VISIBILITY="--private"
[[ "${2:-}" == "--public" ]] && VISIBILITY="--public"

command -v gh >/dev/null || { echo "Instala GitHub CLI: https://cli.github.com"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "Ejecuta antes: gh auth login"; exit 1; }

gh repo create "$REPO" $VISIBILITY --source=. --remote=origin --push
echo "Listo: $(gh repo view "$REPO" --json url -q .url)"
