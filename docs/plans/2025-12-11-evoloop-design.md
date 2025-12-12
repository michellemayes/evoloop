# Evoloop Design Document

## Overview

**Evoloop** is an autonomous landing page optimization engine. Users add a script tag, the system extracts brand constraints, generates variants, and continuously tests them using multi-armed bandit allocation - all without human intervention.

**Target User:** Solo founders / indie hackers with 500+ daily visitors who are comfortable letting the system "go rogue" to learn what converts.

## Core Architecture

### Three Main Components

1. **Ingestion & Analysis Service** - Scrapes the connected landing page, extracts brand constraints (colors, fonts, tone, imagery style), analyzes structure, and identifies mutable elements. Also scrapes competitors if URLs provided.

2. **Variant Generation Engine** - Uses LLM (via OpenRouter) + image generation (Nano Banana / Gemini 2.5 Flash) to create new page variants. Respects brand constraints. Generates text, layout, and visual mutations based on what's winning.

3. **Runtime & Experimentation Layer** - The script tag that runs on the user's site. Handles visitor assignment, serves variants, tracks conversions, and reports back. Implements Thompson Sampling for traffic allocation.

### Supporting Infrastructure

- **Database:** Neon Postgres (with alembic for ORM migrations)
- **Auth:** Neon Auth
- **Background Jobs:** Trigger.dev
- **Hosting:** Vercel (all components)

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React (Next.js on Vercel), shadcn/ui, Tailwind CSS |
| **Backend API** | Python (Vercel serverless functions) |
| **Database** | Neon Postgres |
| **Auth** | Neon Auth |
| **Background Jobs** | Trigger.dev |
| **Scraping/Screenshots** | Playwright (headless, server-side via Trigger.dev) |
| **LLM (text)** | OpenRouter API |
| **Image Generation** | Nano Banana (Gemini 2.5 Flash Image Preview) |
| **Runtime Script** | Vanilla JS, served from Vercel Edge |
| **Payments** | Polar (4% + $0.40, MoR) |
| **Testing** | pytest, Vitest, React Testing Library, Playwright E2E |

## Variant Generation Pipeline

### Phase 1: Initial Analysis (cold start)

When a user connects a new page:

1. **Scrape the original page** - Playwright captures full HTML, CSS, assets, screenshots at multiple breakpoints
2. **Extract brand constraints** - LLM analyzes the page and outputs a structured brand config:
   - Color palette (primary, secondary, accent, background)
   - Typography (font families, heading sizes, body size)
   - Tone of voice (formal/casual, technical/simple, etc.)
   - Imagery style (photography vs illustration, mood, subjects)
   - Logo placement rules, required legal text, etc.
3. **Identify mutable elements** - Map the page into regions: hero, headline, subhead, CTA, social proof, features, etc.
4. **Competitor/best-practice analysis** - If user provides competitor URLs, scrape those too.
5. **Generate initial variant batch** - Create 3-5 variants based on analysis.

### Phase 2: Continuous Generation (the loop)

1. **Monitor experiment state** - Every N hours (configurable), check which variants are winning/losing
2. **Learn from winners** - LLM analyzes what's working
3. **Generate next-gen variants** - Create 1-2 new variants that combine winning traits + new hypotheses
4. **Retire losers** - Variants below a confidence threshold get removed from rotation
5. **Repeat** - Loop continues indefinitely until user pauses

## Multi-Armed Bandit & Statistical Tracking

### Algorithm: Thompson Sampling

- Each variant maintains a Beta distribution parameterized by (successes + 1, failures + 1)
- On each visitor: sample from each variant's distribution, serve the one with highest sample
- On conversion: update that variant's success count
- On no-conversion: update failure count (after attribution window)

### Statistical Rigor

- Conversion rate point estimates with 95% credible intervals
- Probability of being best for each variant
- Expected lift vs control with confidence intervals
- Sample size & power calculations

### Thresholds

- **Promote to winner:** >95% probability of being best AND credible interval excludes zero lift
- **Kill a loser:** <5% probability of being best after minimum sample size (100 visitors)
- **Generate new variants:** When top 2 variants converge or all tested for X days

## Runtime Script

The `<script src="evoloop.js">` does:

1. **Initialize** - Reads site ID, checks for existing visitor cookie
2. **Fetch assignment** - Calls API for variant assignment
3. **Apply variant** - Receives lightweight JSON patch, applies DOM changes
4. **Track conversions** - Listens for auto-detected events or explicit `evoloop.convert()` calls
5. **Report back** - Sends impression and conversion events

### Anti-flicker

```html
<script>document.documentElement.style.opacity='0'</script>
<script src="https://evoloop.dev/s/SITE_ID.js" async onload="document.documentElement.style.opacity='1'"></script>
```

## Dashboard Views

### Minimal View (default)
- Current status, best performer, lift vs original, next action, quick controls

### Timeline View
- Git-log style experiment history with diffs between variants

### Stats Deep-Dive View
- Posterior distributions, confidence intervals over time, traffic allocation history, raw data export

## User Onboarding Flow

1. Sign up (Neon Auth)
2. Enter landing page URL
3. Review auto-extracted brand constraints
4. Set conversion goal (auto-detected or manual)
5. Choose autonomy mode (Supervised / Training Wheels / Full Auto)
6. Install script tag
7. Analysis begins (~2 hours), email when ready

## Data Model

```sql
users
├── id (uuid, from Neon Auth)
├── email
├── created_at
├── plan (free | pro | enterprise)
└── settings (jsonb)

sites
├── id (uuid)
├── user_id → users
├── url
├── status (analyzing | running | paused)
├── autonomy_mode (supervised | training_wheels | full_auto)
├── approvals_remaining (int)
├── brand_constraints (jsonb)
├── created_at
└── updated_at

variants
├── id (uuid)
├── site_id → sites
├── parent_variant_id → variants (null for original)
├── patch (jsonb)
├── screenshot_url
├── generation_reasoning (text)
├── status (pending_review | active | winner | killed)
├── created_at
└── killed_at

experiment_stats
├── variant_id → variants
├── visitors (int)
├── conversions (int)
├── alpha (float)
├── beta (float)
├── prob_best (float)
└── updated_at

events
├── id (uuid)
├── site_id → sites
├── variant_id → variants
├── visitor_id (string)
├── event_type (impression | conversion)
├── metadata (jsonb)
└── created_at

conversion_goals
├── id (uuid)
├── site_id → sites
├── type (url | event | auto_form | auto_click)
├── config (jsonb)
└── created_at
```

## Trigger.dev Jobs

1. **analyze-new-site** - Scrape page, extract brand constraints, identify mutable elements
2. **generate-initial-variants** - Create 3-5 initial variants
3. **generate-next-variants** - Scheduled evolution of winning variants
4. **update-stats** - Aggregate events, update Beta distributions (every 5 min)
5. **cleanup-old-events** - Archive old events daily

## API Routes

### Public (runtime script)
- `GET /v1/assign` - Get variant assignment
- `POST /v1/event` - Record impression/conversion

### Authenticated (dashboard)
- Sites: CRUD operations
- Variants: List, approve, pause, kill, diff
- Stats: Aggregated data, timeline, export
- Goals: CRUD operations

### Admin
- User management, system health, experiment oversight, cost tracking, feature flags

## Payments & Pricing

**Provider:** Polar (4% + $0.40, Merchant of Record)

| Plan | Price | Includes |
|------|-------|----------|
| Starter | $5 one-time | Initial AI credits |
| Pay-as-you-go | Usage-based | Top up as needed |
| Pro | $49/mo | Unlimited variants, priority, advanced stats |

### Cost Transparency

Users see estimated costs before starting:
- Text variants only: ~$3-8/mo
- Text + image variants: ~$15-40/mo

Image generation toggle (off by default) to control costs.

## UI Requirements

- **shadcn/ui** component library
- Dark mode support
- Linear/Vercel-quality polish
- Data viz with Recharts or Tremor
- Command palette (⌘K)

## Testing Requirements

**Target: 90%+ code coverage**

- Python API: pytest + pytest-cov
- React frontend: Vitest + React Testing Library
- Components: Storybook
- E2E: Playwright
- CI: GitHub Actions with coverage gate

## Admin Interface

- User management and impersonation
- System health and job status
- Experiment oversight and emergency controls
- Cost tracking (LLM/image gen spend per user)
- Feature flags
- Content review queue and abuse detection
