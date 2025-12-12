#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

FIX=false

if [ "$1" = "--fix" ] || [ "$1" = "-f" ]; then
    FIX=true
fi

echo "==> Linting Evoloop codebase..."
echo ""

FAILED=0

# Lint frontend
echo "==> ESLint (Frontend)..."
if [ "$FIX" = true ]; then
    pnpm eslint . --fix || FAILED=1
else
    pnpm eslint . || FAILED=1
fi
echo ""

# Type check frontend
echo "==> TypeScript type check..."
pnpm tsc --noEmit || FAILED=1
echo ""

# Summary
if [ $FAILED -eq 0 ]; then
    echo "==> All checks passed!"
else
    echo "==> Some checks failed!"
    if [ "$FIX" = false ]; then
        echo ""
        echo "Tip: Run with --fix to auto-fix issues"
    fi
    exit 1
fi
