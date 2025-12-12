#!/bin/bash
set -e

echo "==> Setting up Evoloop development environment"

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Error: Node.js is required but not installed."; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "Error: pnpm is required. Install with: npm install -g pnpm"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Error: Python 3 is required but not installed."; exit 1; }

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "==> Installing frontend dependencies..."
pnpm install

echo "==> Setting up Python virtual environment..."
cd "$PROJECT_ROOT/api"

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "==> Checking environment configuration..."
cd "$PROJECT_ROOT"

if [ ! -f ".env.local" ]; then
    echo "==> Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo ""
    echo "WARNING: Please update .env.local with your actual values:"
    echo "  - DATABASE_URL: Your Neon PostgreSQL connection string"
    echo "  - NEXTAUTH_SECRET: Generate with 'openssl rand -base64 32'"
    echo ""
fi

echo "==> Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update .env.local with your database credentials"
echo "  2. Run migrations: ./scripts/migrate.sh"
echo "  3. Start development: ./scripts/dev.sh"
