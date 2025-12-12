#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Parse arguments
RUN_FRONTEND=true
RUN_BACKEND=true
VERBOSE=false
COVERAGE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --frontend|-f)
            RUN_FRONTEND=true
            RUN_BACKEND=false
            shift
            ;;
        --backend|-b)
            RUN_FRONTEND=false
            RUN_BACKEND=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --coverage|-c)
            COVERAGE=true
            shift
            ;;
        --help|-h)
            echo "Usage: ./scripts/test.sh [options]"
            echo ""
            echo "Options:"
            echo "  -f, --frontend   Run frontend tests only"
            echo "  -b, --backend    Run backend tests only"
            echo "  -v, --verbose    Verbose output"
            echo "  -c, --coverage   Show coverage report"
            echo "  -h, --help       Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

FAILED=0

# Run frontend tests
if [ "$RUN_FRONTEND" = true ]; then
    echo "==> Running frontend tests..."
    echo ""

    if [ "$VERBOSE" = true ]; then
        pnpm test -- --reporter=verbose || FAILED=1
    else
        pnpm test || FAILED=1
    fi
    echo ""
fi

# Run backend tests
if [ "$RUN_BACKEND" = true ]; then
    echo "==> Running backend tests..."
    echo ""

    cd "$PROJECT_ROOT/api"
    source venv/bin/activate

    PYTEST_ARGS="-v"
    if [ "$COVERAGE" = true ]; then
        PYTEST_ARGS="$PYTEST_ARGS --cov-report=term-missing"
    fi

    python -m pytest tests/ $PYTEST_ARGS || FAILED=1
    echo ""
fi

# Summary
if [ $FAILED -eq 0 ]; then
    echo "==> All tests passed!"
else
    echo "==> Some tests failed!"
    exit 1
fi
