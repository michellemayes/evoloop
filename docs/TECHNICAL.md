# Evoloop Technical Documentation

## Overview

Evoloop is an autonomous landing page optimization engine that uses AI to generate, test, and evolve high-converting page variants using Thompson Sampling. The system provides continuous A/B testing with intelligent traffic allocation that naturally shifts toward winning variants.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│  Browser                          Dashboard (Next.js)                    │
│  ┌─────────────┐                  ┌──────────────────────────────────┐  │
│  │ evoloop.js  │◄────────────────►│  React 19 + shadcn/ui + Tailwind │  │
│  │ (runtime)   │                  │  App Router (Next.js 16)          │  │
│  └─────────────┘                  └──────────────────────────────────┘  │
└──────────┬─────────────────────────────────────┬────────────────────────┘
           │                                     │
           │ /api/v1/assign                      │ /api/*
           │ /api/v1/event                       │
           ▼                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                        FastAPI (Python 3.11+)                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  routes/auth.py      │ User signup/login                          │   │
│  │  routes/sites.py     │ Site CRUD operations                       │   │
│  │  routes/variants.py  │ Variant management (approve/kill)          │   │
│  │  routes/runtime.py   │ Public endpoints (assign variant, events)  │   │
│  │  routes/stats.py     │ Statistics aggregation & Thompson params   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  services/thompson_sampling.py                                    │   │
│  │  Beta distribution sampling for multi-armed bandit allocation     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────┬──────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  Neon PostgreSQL                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  users         │ Authentication & ownership                       │   │
│  │  sites         │ Landing pages + brand constraints                │   │
│  │  variants      │ Page patches + Thompson params (alpha/beta)      │   │
│  │  events        │ Impressions & conversions                        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  SQLAlchemy 2.0 ORM + Alembic Migrations                                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        BACKGROUND JOBS (Trigger.dev)                     │
├─────────────────────────────────────────────────────────────────────────┤
│  analyze-site.ts      │ Scrape page → Extract brand constraints (LLM)   │
│  generate-variants.ts │ Create variants via OpenRouter (Claude/Gemini)  │
│  update-stats.ts      │ Aggregate events → Update Thompson parameters   │
│                       │ Scheduled: every 5 minutes via cron             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.10 | App Router, SSR, API routes |
| React | 19.2.1 | UI components |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | latest | Component library (Radix primitives) |
| Lucide React | 0.560.0 | Icons |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | ≥0.109.0 | REST API framework |
| Python | 3.11+ | Runtime |
| SQLAlchemy | ≥2.0.0 | ORM |
| Alembic | ≥1.13.0 | Database migrations |
| Pydantic | ≥2.0.0 | Data validation |
| psycopg2-binary | ≥2.9.9 | PostgreSQL driver |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Neon PostgreSQL | Serverless Postgres database |
| Stack Auth (Neon Auth) | Authentication |
| Trigger.dev | Background job processing |
| Vercel | Frontend + serverless deployment |
| OpenRouter | AI model gateway (Claude, Gemini) |

---

## Test Coverage

### Frontend (Vitest + React Testing Library)

```
Coverage Report
---------------|---------|----------|---------|---------|-------------------
File           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------|---------|----------|---------|---------|-------------------
All files      |      75 |    66.66 |      70 |      75 |
 app           |     100 |      100 |     100 |     100 |
  page.tsx     |     100 |      100 |     100 |     100 |
 components/ui |      70 |    66.66 |    62.5 |      70 |
  button.tsx   |     100 |    66.66 |     100 |     100 | 49
  card.tsx     |   57.14 |      100 |   57.14 |   57.14 | 42-52,75
 lib           |     100 |      100 |     100 |     100 |
  utils.ts     |     100 |      100 |     100 |     100 |
---------------|---------|----------|---------|---------|-------------------
```

**Coverage Thresholds (vitest.config.ts):**
- Branches: 90%
- Functions: 90%
- Lines: 90%
- Statements: 90%

**Test Commands:**
```bash
pnpm test              # Run tests
pnpm test:coverage     # Run with coverage
pnpm test:ui           # Interactive UI
```

### Backend (pytest + pytest-cov)

```
Coverage Report
Name                              Stmts   Miss  Cover   Missing
---------------------------------------------------------------
db/models.py                         74      0   100%
index.py                             15      0   100%
routes/auth.py                       33      0   100%
routes/runtime.py                    30      2    93%   21, 32
routes/sites.py                      49      4    92%   62, 67, 69, 80
routes/stats.py                      60     45    25%   17-48, 54-110, 116-126
routes/variants.py                   43      2    95%   38, 56
schemas/*                            31      0   100%
services/thompson_sampling.py        33      0   100%
---------------------------------------------------------------
TOTAL                               630     59    91%

26 tests passed | Required coverage: 90% | Actual: 90.63%
```

**Test Commands:**
```bash
cd api && source venv/bin/activate
python -m pytest tests/ -v                    # Run tests
python -m pytest tests/ -v --cov=. --cov-report=html  # With coverage
```

### Test Structure

```
tests/                          # Frontend tests
├── setup.ts                    # Jest-DOM matchers
└── home.test.tsx              # Home page tests (2 tests)

api/tests/                      # Backend tests
├── conftest.py                # Fixtures (test DB, test client)
├── test_auth.py               # Auth endpoint tests (4 tests)
├── test_health.py             # Health check test (1 test)
├── test_runtime.py            # Runtime API tests (4 tests)
├── test_sites.py              # Sites CRUD tests (5 tests)
├── test_thompson_sampling.py  # Algorithm tests (8 tests)
└── test_variants.py           # Variant management tests (4 tests)
```

---

## Project Structure

```
evoloop/
├── app/                        # Next.js App Router
│   ├── page.tsx               # Landing page
│   ├── layout.tsx             # Root layout
│   ├── (dashboard)/           # Dashboard route group
│   │   ├── layout.tsx         # Dashboard layout
│   │   └── dashboard/
│   │       ├── page.tsx       # Dashboard home
│   │       └── sites/
│   │           ├── page.tsx   # Sites list
│   │           └── [siteId]/
│   │               └── page.tsx  # Site detail
│   ├── handler/[...stack]/    # Stack Auth handler
│   └── api/
│       └── sites/route.ts     # Next.js API routes
│
├── api/                        # Python FastAPI backend
│   ├── index.py               # FastAPI app entry
│   ├── alembic.ini            # Migration config
│   ├── requirements.txt       # Python dependencies
│   ├── db/
│   │   ├── connection.py      # SQLAlchemy engine + session
│   │   └── models.py          # ORM models
│   ├── routes/
│   │   ├── auth.py            # /api/auth/*
│   │   ├── sites.py           # /api/sites/*
│   │   ├── variants.py        # /api/variants/*
│   │   ├── runtime.py         # /api/v1/assign, /api/v1/event
│   │   └── stats.py           # /api/stats/*
│   ├── schemas/               # Pydantic schemas
│   ├── services/
│   │   └── thompson_sampling.py  # Multi-armed bandit
│   └── tests/                 # pytest tests
│
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── dashboard/             # Dashboard-specific components
│
├── lib/
│   ├── utils.ts               # cn() utility
│   └── stack.ts               # Stack Auth server app
│
├── trigger/                    # Trigger.dev background jobs
│   ├── analyze-site.ts        # Brand constraint extraction
│   ├── generate-variants.ts   # AI variant generation
│   └── update-stats.ts        # Stats aggregation (cron)
│
├── public/                     # Static assets
├── types/                      # TypeScript types
└── docs/                       # Documentation
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new user |
| POST | `/api/auth/login` | Authenticate user |

### Sites
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sites` | List user's sites |
| POST | `/api/sites` | Create new site |
| GET | `/api/sites/{id}` | Get site details |
| PATCH | `/api/sites/{id}` | Update site |
| DELETE | `/api/sites/{id}` | Delete site |

### Variants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sites/{id}/variants` | List site variants |
| POST | `/api/variants` | Create variant |
| PATCH | `/api/variants/{id}` | Update variant status |
| GET | `/api/variants/{id}/diff` | Get variant diff |

### Runtime (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/assign` | Get variant via Thompson Sampling |
| POST | `/api/v1/event` | Record impression/conversion |

### Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats/{site_id}` | Get site statistics |
| POST | `/api/stats/update/{site_id}` | Update Thompson parameters |
| POST | `/api/stats/update-all` | Update all sites |

---

## Core Algorithm: Thompson Sampling

The system uses Thompson Sampling (a Bayesian multi-armed bandit algorithm) for variant allocation:

```python
class ThompsonSampler:
    @staticmethod
    def select_variant(variants: List[Tuple[str, float, float]], visitor_id: str = None) -> str:
        """
        Select variant using Thompson Sampling.

        Args:
            variants: List of (variant_id, alpha, beta) tuples
                     alpha = successes + 1 (conversions)
                     beta = failures + 1 (impressions - conversions)
            visitor_id: Optional ID for deterministic selection

        Returns:
            Selected variant_id
        """
        # Sample from Beta(alpha, beta) for each variant
        # Select variant with highest sample
```

**Benefits:**
- Automatically balances exploration vs exploitation
- Converges to best variant while still testing others
- Handles multiple variants simultaneously
- Visitor ID ensures consistent experience per user

---

## Background Jobs

### analyze-site
- **Trigger:** Manual (on site creation)
- **Purpose:** Scrape landing page, extract brand constraints via LLM
- **Output:** Colors, typography, tone, imagery style

### generate-variants
- **Trigger:** Manual (user-initiated)
- **Purpose:** Generate landing page variants via OpenRouter
- **Models:** Claude 3 Haiku (text), Gemini Flash (images)
- **Output:** Headline, subheadline, CTA, hero image patches

### update-stats
- **Trigger:** Cron (every 5 minutes)
- **Purpose:** Aggregate events, update Thompson Sampling parameters
- **Updates:** Alpha/beta values, probability of being best

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Auth (Neon Auth)
NEXT_PUBLIC_NEON_AUTH_URL=https://ep-xxx.neonauth.us-east-2.aws.neon.build/neondb/auth

# API
NEXT_PUBLIC_API_URL=http://localhost:8000

# AI (OpenRouter)
OPENROUTER_API_KEY=your-openrouter-key

# Background Jobs (Trigger.dev)
TRIGGER_SECRET_KEY=your-trigger-key
```

---

## Development Commands

```bash
# Frontend
pnpm install          # Install dependencies
pnpm dev              # Start dev server (port 3000)
pnpm build            # Production build
pnpm test             # Run tests
pnpm test:coverage    # Coverage report

# Backend
cd api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn index:app --reload --port 8000

# Database
alembic upgrade head  # Run migrations
alembic revision --autogenerate -m "message"  # Create migration

# Background Jobs
npx trigger.dev@latest dev   # Local development
npx trigger.dev@latest deploy  # Deploy to production
```

---

## Deployment

### Vercel (Frontend + Python Backend)
1. Push to GitHub
2. Connect repository in Vercel
3. Add environment variables
4. Python backend runs as serverless functions via `vercel.json`

### Database Migrations
```bash
DATABASE_URL=your-production-url alembic upgrade head
```

### Trigger.dev
```bash
npx trigger.dev@latest deploy
```
