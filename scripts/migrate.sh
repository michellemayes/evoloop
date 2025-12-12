#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Load environment variables
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL not set. Check your .env.local file."
    exit 1
fi

cd "$PROJECT_ROOT/api"
source venv/bin/activate

case "${1:-upgrade}" in
    upgrade)
        echo "==> Running database migrations..."
        alembic upgrade head
        echo "==> Migrations complete!"
        ;;
    downgrade)
        echo "==> Rolling back last migration..."
        alembic downgrade -1
        echo "==> Rollback complete!"
        ;;
    new)
        if [ -z "$2" ]; then
            echo "Usage: ./scripts/migrate.sh new <migration_name>"
            exit 1
        fi
        echo "==> Creating new migration: $2"
        alembic revision --autogenerate -m "$2"
        echo "==> Migration created! Review the file in api/alembic/versions/"
        ;;
    current)
        echo "==> Current migration status:"
        alembic current
        ;;
    history)
        echo "==> Migration history:"
        alembic history
        ;;
    *)
        echo "Usage: ./scripts/migrate.sh [command]"
        echo ""
        echo "Commands:"
        echo "  upgrade    Apply all pending migrations (default)"
        echo "  downgrade  Roll back the last migration"
        echo "  new <name> Create a new migration"
        echo "  current    Show current migration"
        echo "  history    Show migration history"
        exit 1
        ;;
esac
