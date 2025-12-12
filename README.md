# Evoloop

Autonomous landing page optimization engine that uses AI to generate, test, and evolve high-converting page variants using Thompson Sampling.

## Features

- **AI-Powered Variant Generation**: Automatically generate landing page variations
- **Thompson Sampling**: Multi-armed bandit algorithm for optimal traffic allocation
- **Real-time A/B Testing**: Inject variants via runtime script
- **Three Autonomy Modes**: Supervised, Training Wheels, or Full Auto (YOLO)
- **Dashboard**: Manage sites, view variants, and track conversions

## Tech Stack

- **Frontend**: Next.js 16, React 19, shadcn/ui, Tailwind CSS
- **Backend**: FastAPI (Python), SQLAlchemy, Alembic
- **Database**: Neon PostgreSQL
- **Auth**: Neon Auth (Stack Auth)
- **Background Jobs**: Trigger.dev
- **Deployment**: Vercel

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- pnpm
- A Neon PostgreSQL database

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/evoloop.git
   cd evoloop
   ```

2. **Install frontend dependencies**
   ```bash
   pnpm install
   ```

3. **Install backend dependencies**
   ```bash
   cd api
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Configure environment variables**

   Copy `.env.example` to `.env.local` and fill in:
   ```bash
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_key
   STACK_SECRET_SERVER_KEY=your_stack_secret
   ```

5. **Run database migrations**
   ```bash
   cd api
   source venv/bin/activate
   alembic upgrade head
   ```

6. **Start the development servers**

   Terminal 1 - Frontend:
   ```bash
   pnpm dev
   ```

   Terminal 2 - Backend:
   ```bash
   cd api
   source venv/bin/activate
   uvicorn index:app --reload --port 8000
   ```

7. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000)

## Development Scripts

The `/scripts` directory contains helper scripts for common development tasks:

```bash
# Initial setup - install dependencies, create venv, configure environment
./scripts/setup.sh

# Start development servers (frontend + backend)
./scripts/dev.sh

# Run tests
./scripts/test.sh              # All tests
./scripts/test.sh --frontend   # Frontend only
./scripts/test.sh --backend    # Backend only
./scripts/test.sh --watch      # Watch mode

# Database migrations
./scripts/migrate.sh status    # Check migration status
./scripts/migrate.sh upgrade   # Run pending migrations
./scripts/migrate.sh create "description"  # Create new migration

# Build for production
./scripts/build.sh

# Linting and type checking
./scripts/lint.sh
./scripts/lint.sh --fix        # Auto-fix issues

# Clean build artifacts
./scripts/clean.sh
```

## Testing

### Frontend Tests
```bash
pnpm test
```

### Backend Tests
```bash
cd api
source venv/bin/activate
python -m pytest tests/ -v
```

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**

   In Vercel Dashboard > Settings > Environment Variables, add:

   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URL` | Neon PostgreSQL connection string |
   | `NEXT_PUBLIC_API_URL` | Your production URL |
   | `NEXT_PUBLIC_STACK_PROJECT_ID` | Stack Auth project ID |
   | `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Stack Auth publishable key |
   | `STACK_SECRET_SERVER_KEY` | Stack Auth secret key |
   | `OPENROUTER_API_KEY` | OpenRouter API key for AI features |

4. **Deploy the Python Backend**

   The Python backend is configured to run as Vercel Serverless Functions via `vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api/$1" }
     ]
   }
   ```

5. **Run Migrations in Production**

   Connect to your Neon database and run:
   ```bash
   DATABASE_URL=your-production-url alembic upgrade head
   ```

6. **Configure Trigger.dev (Optional)**

   For background jobs:
   - Create account at [trigger.dev](https://trigger.dev)
   - Add `TRIGGER_SECRET_KEY` to Vercel environment variables
   - Deploy triggers: `npx trigger.dev@latest deploy`

### Deploy Python Backend Separately (Alternative)

If you prefer to deploy the Python backend separately:

1. **Railway/Render/Fly.io**
   ```bash
   cd api
   # Deploy using their CLI or GitHub integration
   ```

2. **Update `NEXT_PUBLIC_API_URL`** in Vercel to point to your backend URL

## Runtime Script Integration

Add the Evoloop script to your landing pages:

```html
<script src="https://your-domain.com/evoloop.js" data-site-id="YOUR_SITE_ID"></script>
```

The script will:
- Fetch the assigned variant via Thompson Sampling
- Apply content patches (headline, subheadline, CTA, hero image)
- Track impressions and conversions automatically

### Manual Conversion Tracking

```javascript
// Track a conversion event
window.evoloop.trackConversion({ type: 'purchase', value: 99.99 });

// Track custom events
window.evoloop.trackEvent('button_click', { button_id: 'cta-main' });
```

## Project Structure

```
evoloop/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard pages
│   ├── handler/           # Stack Auth handler routes
│   └── api/               # Next.js API routes
├── api/                   # Python FastAPI backend
│   ├── routes/            # API endpoints
│   ├── db/                # Database models & connection
│   ├── services/          # Business logic (Thompson Sampling)
│   ├── schemas/           # Pydantic schemas
│   └── tests/             # pytest tests
├── components/            # React components
├── lib/                   # Shared utilities
├── public/                # Static assets (evoloop.js)
├── scripts/               # Development helper scripts
└── trigger/               # Trigger.dev background jobs
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | Create new user |
| `/api/auth/login` | POST | Authenticate user |
| `/api/sites` | GET/POST | List/create sites |
| `/api/sites/{id}` | GET/PUT/DELETE | Manage site |
| `/api/sites/{id}/variants` | GET | List variants |
| `/api/variants/{id}` | PATCH | Update variant status |
| `/api/v1/assign` | GET | Get variant assignment (public) |
| `/api/v1/event` | POST | Record event (public) |

## License

MIT
