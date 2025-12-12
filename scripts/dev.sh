#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "Error: .env.local not found. Run ./scripts/setup.sh first."
    exit 1
fi

echo "==> Starting Evoloop development servers..."
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "==> Shutting down servers..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
cd "$PROJECT_ROOT/api"
source venv/bin/activate
uvicorn index:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend
cd "$PROJECT_ROOT"
pnpm dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
