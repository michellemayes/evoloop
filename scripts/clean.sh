#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "==> Cleaning build artifacts..."

# Remove Next.js build
rm -rf .next
echo "  Removed .next/"

# Remove node_modules (optional, with flag)
if [ "$1" = "--all" ] || [ "$1" = "-a" ]; then
    rm -rf node_modules
    echo "  Removed node_modules/"

    rm -rf api/venv
    echo "  Removed api/venv/"
fi

# Remove Python cache
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
echo "  Removed Python cache"

# Remove pytest cache
rm -rf api/.pytest_cache
rm -rf api/htmlcov
rm -rf api/.coverage
echo "  Removed pytest cache"

echo ""
echo "==> Clean complete!"

if [ "$1" != "--all" ] && [ "$1" != "-a" ]; then
    echo ""
    echo "Tip: Use --all to also remove node_modules and venv"
fi
