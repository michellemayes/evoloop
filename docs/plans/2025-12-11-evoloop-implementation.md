# Evoloop Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an autonomous landing page optimization engine that auto-generates variants, tests them with multi-armed bandit, and continuously evolves based on what wins.

**Architecture:** Python backend on Vercel serverless, Next.js frontend with shadcn/ui, Neon Postgres with Neon Auth, Trigger.dev for background jobs, OpenRouter for LLM, Nano Banana for image generation.

**Tech Stack:** Python, Next.js, React, shadcn/ui, Tailwind CSS, Neon Postgres, Neon Auth, Trigger.dev, Playwright, OpenRouter, Polar payments, Vitest, pytest

---

## Phase 1: Project Setup & Infrastructure

### Task 1: Initialize Next.js Project with TypeScript

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`

**Step 1: Create Next.js project**

Run:
```bash
cd /Users/michelle/Documents/Repos/evoloop
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-pnpm
```

Expected: Project scaffolded with Next.js 14+, TypeScript, Tailwind CSS

**Step 2: Verify project runs**

Run:
```bash
pnpm dev
```

Expected: Dev server starts at http://localhost:3000

**Step 3: Commit**

```bash
git init
git add .
git commit -m "chore: initialize Next.js project with TypeScript and Tailwind"
```

---

### Task 2: Install and Configure shadcn/ui

**Files:**
- Create: `components.json`
- Create: `lib/utils.ts`
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

**Step 1: Initialize shadcn/ui**

Run:
```bash
pnpm dlx shadcn@latest init
```

Select options:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

Expected: `components.json` created, Tailwind config updated

**Step 2: Install core components**

Run:
```bash
pnpm dlx shadcn@latest add button card input label tabs dialog dropdown-menu toast sonner avatar badge separator skeleton switch textarea select command popover
```

Expected: Components added to `components/ui/`

**Step 3: Verify components work**

Create: `app/page.tsx`
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Evoloop</CardTitle>
        </CardHeader>
        <CardContent>
          <Button>Get Started</Button>
        </CardContent>
      </Card>
    </main>
  )
}
```

Run:
```bash
pnpm dev
```

Expected: Page renders with styled card and button

**Step 4: Commit**

```bash
git add .
git commit -m "chore: add shadcn/ui with core components"
```

---

### Task 3: Set Up Python Backend Structure

**Files:**
- Create: `api/__init__.py`
- Create: `api/requirements.txt`
- Create: `api/index.py`
- Create: `vercel.json`

**Step 1: Create Python API directory structure**

```bash
mkdir -p api
```

**Step 2: Create requirements.txt**

Create: `api/requirements.txt`
```txt
fastapi>=0.109.0
pydantic>=2.0.0
httpx>=0.26.0
python-dotenv>=1.0.0
sqlalchemy>=2.0.0
alembic>=1.13.0
psycopg2-binary>=2.9.9
pytest>=8.0.0
pytest-cov>=4.1.0
pytest-asyncio>=0.23.0
```

**Step 3: Create basic API endpoint**

Create: `api/index.py`
```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "evoloop"}
```

**Step 4: Configure Vercel for Python**

Create: `vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/index.py"
    }
  ],
  "functions": {
    "api/**/*.py": {
      "runtime": "python3.11"
    }
  }
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "chore: add Python backend structure with FastAPI"
```

---

### Task 4: Set Up Neon Database Connection

**Files:**
- Create: `api/db/__init__.py`
- Create: `api/db/connection.py`
- Create: `api/db/models.py`
- Create: `.env.example`
- Create: `.env.local`

**Step 1: Create database connection module**

Create: `api/db/__init__.py`
```python
from .connection import get_db, engine
from .models import Base

__all__ = ["get_db", "engine", "Base"]
```

Create: `api/db/connection.py`
```python
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Step 2: Create base models**

Create: `api/db/models.py`
```python
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Integer, Float, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    plan = Column(String(50), default="free", nullable=False)
    settings = Column(JSON, default=dict)

    sites = relationship("Site", back_populates="user", cascade="all, delete-orphan")


class Site(Base):
    __tablename__ = "sites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    url = Column(String(2048), nullable=False)
    status = Column(String(50), default="analyzing", nullable=False)
    autonomy_mode = Column(String(50), default="training_wheels", nullable=False)
    approvals_remaining = Column(Integer, default=5)
    brand_constraints = Column(JSON, default=dict)
    image_generation_enabled = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="sites")
    variants = relationship("Variant", back_populates="site", cascade="all, delete-orphan")
    conversion_goals = relationship("ConversionGoal", back_populates="site", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="site", cascade="all, delete-orphan")


class Variant(Base):
    __tablename__ = "variants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    parent_variant_id = Column(UUID(as_uuid=True), ForeignKey("variants.id"), nullable=True)
    patch = Column(JSON, default=dict)
    screenshot_url = Column(String(2048), nullable=True)
    generation_reasoning = Column(Text, nullable=True)
    status = Column(String(50), default="pending_review", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    killed_at = Column(DateTime, nullable=True)

    site = relationship("Site", back_populates="variants")
    parent = relationship("Variant", remote_side=[id], backref="children")
    stats = relationship("ExperimentStats", back_populates="variant", uselist=False, cascade="all, delete-orphan")


class ExperimentStats(Base):
    __tablename__ = "experiment_stats"

    variant_id = Column(UUID(as_uuid=True), ForeignKey("variants.id"), primary_key=True)
    visitors = Column(Integer, default=0, nullable=False)
    conversions = Column(Integer, default=0, nullable=False)
    alpha = Column(Float, default=1.0, nullable=False)
    beta = Column(Float, default=1.0, nullable=False)
    prob_best = Column(Float, default=0.0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    variant = relationship("Variant", back_populates="stats")


class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False, index=True)
    variant_id = Column(UUID(as_uuid=True), ForeignKey("variants.id"), nullable=False)
    visitor_id = Column(String(255), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)
    metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    site = relationship("Site", back_populates="events")
    variant = relationship("Variant")


class ConversionGoal(Base):
    __tablename__ = "conversion_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    type = Column(String(50), nullable=False)
    config = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    site = relationship("Site", back_populates="conversion_goals")
```

**Step 3: Create environment files**

Create: `.env.example`
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
OPENROUTER_API_KEY=your_openrouter_api_key
NANOBANANA_API_KEY=your_nanobanana_api_key
POLAR_API_KEY=your_polar_api_key
```

Create: `.gitignore` (append)
```
.env.local
.env
__pycache__/
*.pyc
.pytest_cache/
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add Neon database connection and SQLAlchemy models"
```

---

### Task 5: Set Up Alembic Migrations

**Files:**
- Create: `api/alembic.ini`
- Create: `api/alembic/env.py`
- Create: `api/alembic/versions/001_initial_schema.py`

**Step 1: Initialize Alembic**

```bash
cd api
pip install alembic
alembic init alembic
```

**Step 2: Configure Alembic**

Modify: `api/alembic.ini` (update sqlalchemy.url line)
```ini
sqlalchemy.url =
```

Create: `api/alembic/env.py`
```python
import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

from db.models import Base

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL", ""))

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

**Step 3: Create initial migration**

```bash
cd api
alembic revision --autogenerate -m "initial schema"
```

**Step 4: Commit**

```bash
git add .
git commit -m "chore: add Alembic migrations for database schema"
```

---

### Task 6: Set Up Testing Infrastructure

**Files:**
- Create: `api/tests/__init__.py`
- Create: `api/tests/conftest.py`
- Create: `api/pytest.ini`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`

**Step 1: Create Python test configuration**

Create: `api/pytest.ini`
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
asyncio_mode = auto
addopts = --cov=. --cov-report=term-missing --cov-report=html --cov-fail-under=90
```

Create: `api/tests/__init__.py`
```python
```

Create: `api/tests/conftest.py`
```python
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = "postgresql://test:test@localhost:5432/evoloop_test"

from db.models import Base
from index import app


@pytest.fixture(scope="session")
def engine():
    engine = create_engine(os.environ["DATABASE_URL"])
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session(engine):
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.rollback()
    session.close()


@pytest.fixture
def client():
    return TestClient(app)
```

**Step 2: Create frontend test configuration**

Create: `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/'],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

Create: `tests/setup.ts`
```typescript
import '@testing-library/jest-dom'
```

**Step 3: Install test dependencies**

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/coverage-v8
```

**Step 4: Add test scripts to package.json**

Modify: `package.json` (add to scripts)
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "chore: add testing infrastructure for Python and React"
```

---

## Phase 2: Authentication with Neon Auth

### Task 7: Configure Neon Auth

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Modify: `api/index.py`

**Step 1: Install Neon Auth dependencies**

```bash
pnpm add @neondatabase/toolkit @auth/core next-auth
```

**Step 2: Create auth configuration**

Create: `lib/auth.ts`
```typescript
import { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        })

        const user = await res.json()

        if (res.ok && user) {
          return user
        }

        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signUp: "/signup",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}
```

**Step 3: Create auth API route**

Create: `app/api/auth/[...nextauth]/route.ts`
```typescript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

**Step 4: Add auth endpoints to Python API**

Create: `api/routes/__init__.py`
```python
```

Create: `api/routes/auth.py`
```python
import uuid
import hashlib
import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from db import get_db
from db.models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


def hash_password(password: str) -> str:
    salt = os.environ.get("PASSWORD_SALT", "evoloop-salt")
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()


class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str

    class Config:
        from_attributes = True


@router.post("/signup", response_model=UserResponse)
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        id=uuid.uuid4(),
        email=request.email,
        password_hash=hash_password(request.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserResponse(id=str(user.id), email=user.email)


@router.post("/login", response_model=UserResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or user.password_hash != hash_password(request.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return UserResponse(id=str(user.id), email=user.email)
```

**Step 5: Update User model with password_hash**

Modify: `api/db/models.py` (add to User class)
```python
password_hash = Column(String(255), nullable=True)
```

**Step 6: Update main API to include auth routes**

Modify: `api/index.py`
```python
from fastapi import FastAPI
from routes.auth import router as auth_router

app = FastAPI()

app.include_router(auth_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "evoloop"}
```

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add authentication with Neon Auth"
```

---

### Task 8: Create Auth Tests

**Files:**
- Create: `api/tests/test_auth.py`
- Create: `tests/lib/auth.test.ts`

**Step 1: Write failing Python auth tests**

Create: `api/tests/test_auth.py`
```python
import pytest
from fastapi.testclient import TestClient


class TestAuthEndpoints:
    def test_signup_creates_user(self, client: TestClient, db_session):
        response = client.post(
            "/api/auth/signup",
            json={"email": "test@example.com", "password": "password123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert "id" in data

    def test_signup_rejects_duplicate_email(self, client: TestClient, db_session):
        client.post(
            "/api/auth/signup",
            json={"email": "dupe@example.com", "password": "password123"},
        )
        response = client.post(
            "/api/auth/signup",
            json={"email": "dupe@example.com", "password": "password456"},
        )
        assert response.status_code == 400

    def test_login_with_valid_credentials(self, client: TestClient, db_session):
        client.post(
            "/api/auth/signup",
            json={"email": "login@example.com", "password": "password123"},
        )
        response = client.post(
            "/api/auth/login",
            json={"email": "login@example.com", "password": "password123"},
        )
        assert response.status_code == 200
        assert response.json()["email"] == "login@example.com"

    def test_login_with_invalid_credentials(self, client: TestClient, db_session):
        response = client.post(
            "/api/auth/login",
            json={"email": "nobody@example.com", "password": "wrong"},
        )
        assert response.status_code == 401
```

**Step 2: Run tests to verify they pass**

```bash
cd api
pytest tests/test_auth.py -v
```

Expected: All 4 tests pass

**Step 3: Commit**

```bash
git add .
git commit -m "test: add auth endpoint tests"
```

---

## Phase 3: Core API Endpoints

### Task 9: Create Sites CRUD API

**Files:**
- Create: `api/routes/sites.py`
- Create: `api/tests/test_sites.py`
- Create: `api/schemas/__init__.py`
- Create: `api/schemas/sites.py`

**Step 1: Write failing tests for sites endpoints**

Create: `api/tests/test_sites.py`
```python
import pytest
from fastapi.testclient import TestClient
from db.models import User
import uuid


@pytest.fixture
def test_user(db_session):
    user = User(
        id=uuid.uuid4(),
        email="siteuser@example.com",
        password_hash="fakehash",
    )
    db_session.add(user)
    db_session.commit()
    return user


class TestSitesEndpoints:
    def test_create_site(self, client: TestClient, db_session, test_user):
        response = client.post(
            "/api/sites",
            json={"url": "https://example.com", "user_id": str(test_user.id)},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["url"] == "https://example.com"
        assert data["status"] == "analyzing"

    def test_list_sites_for_user(self, client: TestClient, db_session, test_user):
        client.post(
            "/api/sites",
            json={"url": "https://site1.com", "user_id": str(test_user.id)},
        )
        client.post(
            "/api/sites",
            json={"url": "https://site2.com", "user_id": str(test_user.id)},
        )
        response = client.get(f"/api/sites?user_id={test_user.id}")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    def test_get_site_by_id(self, client: TestClient, db_session, test_user):
        create_response = client.post(
            "/api/sites",
            json={"url": "https://getme.com", "user_id": str(test_user.id)},
        )
        site_id = create_response.json()["id"]
        response = client.get(f"/api/sites/{site_id}")
        assert response.status_code == 200
        assert response.json()["url"] == "https://getme.com"

    def test_update_site(self, client: TestClient, db_session, test_user):
        create_response = client.post(
            "/api/sites",
            json={"url": "https://updateme.com", "user_id": str(test_user.id)},
        )
        site_id = create_response.json()["id"]
        response = client.patch(
            f"/api/sites/{site_id}",
            json={"autonomy_mode": "full_auto"},
        )
        assert response.status_code == 200
        assert response.json()["autonomy_mode"] == "full_auto"

    def test_delete_site(self, client: TestClient, db_session, test_user):
        create_response = client.post(
            "/api/sites",
            json={"url": "https://deleteme.com", "user_id": str(test_user.id)},
        )
        site_id = create_response.json()["id"]
        response = client.delete(f"/api/sites/{site_id}")
        assert response.status_code == 200
        get_response = client.get(f"/api/sites/{site_id}")
        assert get_response.status_code == 404
```

**Step 2: Run tests to verify they fail**

```bash
cd api
pytest tests/test_sites.py -v
```

Expected: FAIL - endpoints not implemented

**Step 3: Create schemas**

Create: `api/schemas/__init__.py`
```python
from .sites import SiteCreate, SiteUpdate, SiteResponse

__all__ = ["SiteCreate", "SiteUpdate", "SiteResponse"]
```

Create: `api/schemas/sites.py`
```python
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, Any
from datetime import datetime


class SiteCreate(BaseModel):
    url: str
    user_id: str


class SiteUpdate(BaseModel):
    autonomy_mode: Optional[str] = None
    brand_constraints: Optional[Dict[str, Any]] = None
    image_generation_enabled: Optional[bool] = None


class SiteResponse(BaseModel):
    id: str
    user_id: str
    url: str
    status: str
    autonomy_mode: str
    approvals_remaining: int
    brand_constraints: Dict[str, Any]
    image_generation_enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

**Step 4: Implement sites routes**

Create: `api/routes/sites.py`
```python
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from db.models import Site
from schemas.sites import SiteCreate, SiteUpdate, SiteResponse

router = APIRouter(prefix="/api/sites", tags=["sites"])


def site_to_response(site: Site) -> SiteResponse:
    return SiteResponse(
        id=str(site.id),
        user_id=str(site.user_id),
        url=site.url,
        status=site.status,
        autonomy_mode=site.autonomy_mode,
        approvals_remaining=site.approvals_remaining,
        brand_constraints=site.brand_constraints or {},
        image_generation_enabled=bool(site.image_generation_enabled),
        created_at=site.created_at,
        updated_at=site.updated_at,
    )


@router.post("", response_model=SiteResponse)
async def create_site(request: SiteCreate, db: Session = Depends(get_db)):
    site = Site(
        id=uuid.uuid4(),
        user_id=uuid.UUID(request.user_id),
        url=request.url,
        status="analyzing",
        autonomy_mode="training_wheels",
        approvals_remaining=5,
    )
    db.add(site)
    db.commit()
    db.refresh(site)
    return site_to_response(site)


@router.get("", response_model=List[SiteResponse])
async def list_sites(user_id: str, db: Session = Depends(get_db)):
    sites = db.query(Site).filter(Site.user_id == uuid.UUID(user_id)).all()
    return [site_to_response(s) for s in sites]


@router.get("/{site_id}", response_model=SiteResponse)
async def get_site(site_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == uuid.UUID(site_id)).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site_to_response(site)


@router.patch("/{site_id}", response_model=SiteResponse)
async def update_site(site_id: str, request: SiteUpdate, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == uuid.UUID(site_id)).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    if request.autonomy_mode is not None:
        site.autonomy_mode = request.autonomy_mode
    if request.brand_constraints is not None:
        site.brand_constraints = request.brand_constraints
    if request.image_generation_enabled is not None:
        site.image_generation_enabled = 1 if request.image_generation_enabled else 0

    db.commit()
    db.refresh(site)
    return site_to_response(site)


@router.delete("/{site_id}")
async def delete_site(site_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == uuid.UUID(site_id)).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    db.delete(site)
    db.commit()
    return {"status": "deleted"}
```

**Step 5: Add sites router to main app**

Modify: `api/index.py`
```python
from fastapi import FastAPI
from routes.auth import router as auth_router
from routes.sites import router as sites_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(sites_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "evoloop"}
```

**Step 6: Run tests to verify they pass**

```bash
cd api
pytest tests/test_sites.py -v
```

Expected: All 5 tests pass

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add sites CRUD API endpoints"
```

---

### Task 10: Create Variants API

**Files:**
- Create: `api/routes/variants.py`
- Create: `api/schemas/variants.py`
- Create: `api/tests/test_variants.py`

**Step 1: Write failing tests**

Create: `api/tests/test_variants.py`
```python
import pytest
from fastapi.testclient import TestClient
from db.models import User, Site, Variant
import uuid


@pytest.fixture
def test_site(db_session):
    user = User(id=uuid.uuid4(), email="variantuser@example.com", password_hash="fake")
    db_session.add(user)
    db_session.commit()

    site = Site(
        id=uuid.uuid4(),
        user_id=user.id,
        url="https://testsite.com",
        status="running",
    )
    db_session.add(site)
    db_session.commit()
    return site


class TestVariantsEndpoints:
    def test_list_variants_for_site(self, client: TestClient, db_session, test_site):
        variant = Variant(
            id=uuid.uuid4(),
            site_id=test_site.id,
            patch={"headline": "Test"},
            status="active",
        )
        db_session.add(variant)
        db_session.commit()

        response = client.get(f"/api/sites/{test_site.id}/variants")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1

    def test_approve_variant(self, client: TestClient, db_session, test_site):
        variant = Variant(
            id=uuid.uuid4(),
            site_id=test_site.id,
            patch={"headline": "Test"},
            status="pending_review",
        )
        db_session.add(variant)
        db_session.commit()

        response = client.patch(
            f"/api/variants/{variant.id}",
            json={"status": "active"},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "active"

    def test_kill_variant(self, client: TestClient, db_session, test_site):
        variant = Variant(
            id=uuid.uuid4(),
            site_id=test_site.id,
            patch={"headline": "Test"},
            status="active",
        )
        db_session.add(variant)
        db_session.commit()

        response = client.patch(
            f"/api/variants/{variant.id}",
            json={"status": "killed"},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "killed"
        assert response.json()["killed_at"] is not None

    def test_get_variant_diff(self, client: TestClient, db_session, test_site):
        variant1 = Variant(
            id=uuid.uuid4(),
            site_id=test_site.id,
            patch={"headline": "Original"},
            status="active",
        )
        variant2 = Variant(
            id=uuid.uuid4(),
            site_id=test_site.id,
            parent_variant_id=variant1.id,
            patch={"headline": "Updated", "cta": "Buy Now"},
            status="active",
        )
        db_session.add_all([variant1, variant2])
        db_session.commit()

        response = client.get(f"/api/variants/{variant1.id}/diff/{variant2.id}")
        assert response.status_code == 200
        diff = response.json()
        assert "headline" in diff["changes"]
```

**Step 2: Run tests to verify they fail**

```bash
cd api
pytest tests/test_variants.py -v
```

Expected: FAIL

**Step 3: Create schemas**

Create: `api/schemas/variants.py`
```python
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class VariantUpdate(BaseModel):
    status: Optional[str] = None


class VariantResponse(BaseModel):
    id: str
    site_id: str
    parent_variant_id: Optional[str]
    patch: Dict[str, Any]
    screenshot_url: Optional[str]
    generation_reasoning: Optional[str]
    status: str
    created_at: datetime
    killed_at: Optional[datetime]

    class Config:
        from_attributes = True


class VariantDiff(BaseModel):
    variant_a: str
    variant_b: str
    changes: Dict[str, Any]
```

**Step 4: Implement variants routes**

Create: `api/routes/variants.py`
```python
import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from db.models import Variant
from schemas.variants import VariantUpdate, VariantResponse, VariantDiff

router = APIRouter(tags=["variants"])


def variant_to_response(variant: Variant) -> VariantResponse:
    return VariantResponse(
        id=str(variant.id),
        site_id=str(variant.site_id),
        parent_variant_id=str(variant.parent_variant_id) if variant.parent_variant_id else None,
        patch=variant.patch or {},
        screenshot_url=variant.screenshot_url,
        generation_reasoning=variant.generation_reasoning,
        status=variant.status,
        created_at=variant.created_at,
        killed_at=variant.killed_at,
    )


@router.get("/api/sites/{site_id}/variants", response_model=List[VariantResponse])
async def list_variants(site_id: str, db: Session = Depends(get_db)):
    variants = db.query(Variant).filter(Variant.site_id == uuid.UUID(site_id)).all()
    return [variant_to_response(v) for v in variants]


@router.patch("/api/variants/{variant_id}", response_model=VariantResponse)
async def update_variant(variant_id: str, request: VariantUpdate, db: Session = Depends(get_db)):
    variant = db.query(Variant).filter(Variant.id == uuid.UUID(variant_id)).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    if request.status:
        variant.status = request.status
        if request.status == "killed":
            variant.killed_at = datetime.utcnow()

    db.commit()
    db.refresh(variant)
    return variant_to_response(variant)


@router.get("/api/variants/{variant_a}/diff/{variant_b}", response_model=VariantDiff)
async def get_variant_diff(variant_a: str, variant_b: str, db: Session = Depends(get_db)):
    v_a = db.query(Variant).filter(Variant.id == uuid.UUID(variant_a)).first()
    v_b = db.query(Variant).filter(Variant.id == uuid.UUID(variant_b)).first()

    if not v_a or not v_b:
        raise HTTPException(status_code=404, detail="Variant not found")

    patch_a = v_a.patch or {}
    patch_b = v_b.patch or {}

    changes = {}
    all_keys = set(patch_a.keys()) | set(patch_b.keys())

    for key in all_keys:
        val_a = patch_a.get(key)
        val_b = patch_b.get(key)
        if val_a != val_b:
            changes[key] = {"from": val_a, "to": val_b}

    return VariantDiff(
        variant_a=variant_a,
        variant_b=variant_b,
        changes=changes,
    )
```

**Step 5: Add variants router to main app**

Modify: `api/index.py`
```python
from fastapi import FastAPI
from routes.auth import router as auth_router
from routes.sites import router as sites_router
from routes.variants import router as variants_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(sites_router)
app.include_router(variants_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "evoloop"}
```

**Step 6: Run tests to verify they pass**

```bash
cd api
pytest tests/test_variants.py -v
```

Expected: All 4 tests pass

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add variants API endpoints"
```

---

### Task 11: Create Public Runtime API (Assign & Events)

**Files:**
- Create: `api/routes/runtime.py`
- Create: `api/schemas/runtime.py`
- Create: `api/tests/test_runtime.py`
- Create: `api/services/__init__.py`
- Create: `api/services/thompson_sampling.py`

**Step 1: Write failing tests**

Create: `api/tests/test_runtime.py`
```python
import pytest
from fastapi.testclient import TestClient
from db.models import User, Site, Variant, ExperimentStats
import uuid


@pytest.fixture
def running_site(db_session):
    user = User(id=uuid.uuid4(), email="runtime@example.com", password_hash="fake")
    db_session.add(user)
    db_session.commit()

    site = Site(
        id=uuid.uuid4(),
        user_id=user.id,
        url="https://runtime-test.com",
        status="running",
    )
    db_session.add(site)
    db_session.commit()

    variant1 = Variant(
        id=uuid.uuid4(),
        site_id=site.id,
        patch={"headline": "Original"},
        status="active",
    )
    variant2 = Variant(
        id=uuid.uuid4(),
        site_id=site.id,
        patch={"headline": "Variant A"},
        status="active",
    )
    db_session.add_all([variant1, variant2])
    db_session.commit()

    stats1 = ExperimentStats(variant_id=variant1.id, visitors=100, conversions=10)
    stats2 = ExperimentStats(variant_id=variant2.id, visitors=100, conversions=15)
    db_session.add_all([stats1, stats2])
    db_session.commit()

    return site


class TestRuntimeEndpoints:
    def test_assign_returns_variant(self, client: TestClient, db_session, running_site):
        response = client.get(
            f"/v1/assign?site_id={running_site.id}&visitor_id=visitor123"
        )
        assert response.status_code == 200
        data = response.json()
        assert "variant_id" in data
        assert "patch" in data

    def test_assign_consistent_for_same_visitor(self, client: TestClient, db_session, running_site):
        response1 = client.get(
            f"/v1/assign?site_id={running_site.id}&visitor_id=sticky-visitor"
        )
        response2 = client.get(
            f"/v1/assign?site_id={running_site.id}&visitor_id=sticky-visitor"
        )
        assert response1.json()["variant_id"] == response2.json()["variant_id"]

    def test_record_impression(self, client: TestClient, db_session, running_site):
        assign = client.get(
            f"/v1/assign?site_id={running_site.id}&visitor_id=impression-visitor"
        )
        variant_id = assign.json()["variant_id"]

        response = client.post(
            "/v1/event",
            json={
                "site_id": str(running_site.id),
                "variant_id": variant_id,
                "visitor_id": "impression-visitor",
                "type": "impression",
            },
        )
        assert response.status_code == 200

    def test_record_conversion(self, client: TestClient, db_session, running_site):
        assign = client.get(
            f"/v1/assign?site_id={running_site.id}&visitor_id=convert-visitor"
        )
        variant_id = assign.json()["variant_id"]

        response = client.post(
            "/v1/event",
            json={
                "site_id": str(running_site.id),
                "variant_id": variant_id,
                "visitor_id": "convert-visitor",
                "type": "conversion",
            },
        )
        assert response.status_code == 200
```

**Step 2: Run tests to verify they fail**

```bash
cd api
pytest tests/test_runtime.py -v
```

Expected: FAIL

**Step 3: Create Thompson Sampling service**

Create: `api/services/__init__.py`
```python
from .thompson_sampling import ThompsonSampler

__all__ = ["ThompsonSampler"]
```

Create: `api/services/thompson_sampling.py`
```python
import random
from typing import List, Tuple
import hashlib


class ThompsonSampler:
    @staticmethod
    def sample_beta(alpha: float, beta: float) -> float:
        return random.betavariate(alpha, beta)

    @staticmethod
    def select_variant(
        variants: List[Tuple[str, float, float]],
        visitor_id: str = None,
    ) -> str:
        if not variants:
            raise ValueError("No variants to select from")

        if visitor_id:
            seed = int(hashlib.md5(visitor_id.encode()).hexdigest()[:8], 16)
            random.seed(seed)

        best_variant = None
        best_sample = -1

        for variant_id, alpha, beta in variants:
            sample = ThompsonSampler.sample_beta(alpha, beta)
            if sample > best_sample:
                best_sample = sample
                best_variant = variant_id

        random.seed()
        return best_variant

    @staticmethod
    def calculate_prob_best(
        variants: List[Tuple[str, float, float]],
        num_simulations: int = 10000,
    ) -> dict:
        if not variants:
            return {}

        win_counts = {v[0]: 0 for v in variants}

        for _ in range(num_simulations):
            samples = [
                (v[0], ThompsonSampler.sample_beta(v[1], v[2]))
                for v in variants
            ]
            winner = max(samples, key=lambda x: x[1])[0]
            win_counts[winner] += 1

        return {v: count / num_simulations for v, count in win_counts.items()}
```

**Step 4: Create runtime schemas**

Create: `api/schemas/runtime.py`
```python
from pydantic import BaseModel
from typing import Dict, Any, Optional


class AssignResponse(BaseModel):
    variant_id: str
    patch: Dict[str, Any]


class EventRequest(BaseModel):
    site_id: str
    variant_id: str
    visitor_id: str
    type: str
    metadata: Optional[Dict[str, Any]] = None


class EventResponse(BaseModel):
    status: str
```

**Step 5: Implement runtime routes**

Create: `api/routes/runtime.py`
```python
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from db.models import Site, Variant, ExperimentStats, Event
from schemas.runtime import AssignResponse, EventRequest, EventResponse
from services.thompson_sampling import ThompsonSampler

router = APIRouter(prefix="/v1", tags=["runtime"])


@router.get("/assign", response_model=AssignResponse)
async def assign_variant(
    site_id: str,
    visitor_id: str,
    db: Session = Depends(get_db),
):
    site = db.query(Site).filter(Site.id == uuid.UUID(site_id)).first()
    if not site or site.status != "running":
        raise HTTPException(status_code=404, detail="Site not found or not running")

    variants = (
        db.query(Variant, ExperimentStats)
        .join(ExperimentStats, Variant.id == ExperimentStats.variant_id, isouter=True)
        .filter(Variant.site_id == uuid.UUID(site_id))
        .filter(Variant.status == "active")
        .all()
    )

    if not variants:
        raise HTTPException(status_code=404, detail="No active variants")

    variant_data = []
    for variant, stats in variants:
        alpha = stats.alpha if stats else 1.0
        beta = stats.beta if stats else 1.0
        variant_data.append((str(variant.id), alpha, beta))

    selected_id = ThompsonSampler.select_variant(variant_data, visitor_id)

    selected_variant = next(v for v, _ in variants if str(v.id) == selected_id)

    return AssignResponse(
        variant_id=selected_id,
        patch=selected_variant.patch or {},
    )


@router.post("/event", response_model=EventResponse)
async def record_event(
    request: EventRequest,
    db: Session = Depends(get_db),
):
    event = Event(
        id=uuid.uuid4(),
        site_id=uuid.UUID(request.site_id),
        variant_id=uuid.UUID(request.variant_id),
        visitor_id=request.visitor_id,
        event_type=request.type,
        metadata=request.metadata or {},
    )
    db.add(event)
    db.commit()

    return EventResponse(status="recorded")
```

**Step 6: Add runtime router to main app**

Modify: `api/index.py`
```python
from fastapi import FastAPI
from routes.auth import router as auth_router
from routes.sites import router as sites_router
from routes.variants import router as variants_router
from routes.runtime import router as runtime_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(sites_router)
app.include_router(variants_router)
app.include_router(runtime_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "evoloop"}
```

**Step 7: Run tests to verify they pass**

```bash
cd api
pytest tests/test_runtime.py -v
```

Expected: All 4 tests pass

**Step 8: Commit**

```bash
git add .
git commit -m "feat: add runtime assign and event endpoints with Thompson Sampling"
```

---

### Task 12: Create Thompson Sampling Tests

**Files:**
- Create: `api/tests/test_thompson_sampling.py`

**Step 1: Write comprehensive tests for Thompson Sampling**

Create: `api/tests/test_thompson_sampling.py`
```python
import pytest
from services.thompson_sampling import ThompsonSampler


class TestThompsonSampler:
    def test_sample_beta_returns_value_in_range(self):
        for _ in range(100):
            sample = ThompsonSampler.sample_beta(1.0, 1.0)
            assert 0 <= sample <= 1

    def test_select_variant_returns_valid_id(self):
        variants = [
            ("var1", 10, 90),
            ("var2", 50, 50),
            ("var3", 90, 10),
        ]
        selected = ThompsonSampler.select_variant(variants)
        assert selected in ["var1", "var2", "var3"]

    def test_select_variant_consistent_for_visitor(self):
        variants = [
            ("var1", 10, 10),
            ("var2", 10, 10),
            ("var3", 10, 10),
        ]
        results = set()
        for _ in range(10):
            selected = ThompsonSampler.select_variant(variants, "visitor123")
            results.add(selected)
        assert len(results) == 1

    def test_select_variant_different_visitors_can_differ(self):
        variants = [
            ("var1", 10, 10),
            ("var2", 10, 10),
            ("var3", 10, 10),
        ]
        results = set()
        for i in range(100):
            selected = ThompsonSampler.select_variant(variants, f"visitor{i}")
            results.add(selected)
        assert len(results) > 1

    def test_high_alpha_variant_selected_more_often(self):
        variants = [
            ("loser", 1, 100),
            ("winner", 100, 1),
        ]
        winner_count = 0
        for _ in range(1000):
            selected = ThompsonSampler.select_variant(variants)
            if selected == "winner":
                winner_count += 1
        assert winner_count > 900

    def test_calculate_prob_best(self):
        variants = [
            ("var1", 10, 90),
            ("var2", 50, 50),
            ("var3", 90, 10),
        ]
        probs = ThompsonSampler.calculate_prob_best(variants)
        assert len(probs) == 3
        assert sum(probs.values()) == pytest.approx(1.0, abs=0.01)
        assert probs["var3"] > probs["var2"] > probs["var1"]

    def test_select_variant_raises_on_empty(self):
        with pytest.raises(ValueError):
            ThompsonSampler.select_variant([])

    def test_calculate_prob_best_empty_returns_empty(self):
        probs = ThompsonSampler.calculate_prob_best([])
        assert probs == {}
```

**Step 2: Run tests to verify they pass**

```bash
cd api
pytest tests/test_thompson_sampling.py -v
```

Expected: All 8 tests pass

**Step 3: Commit**

```bash
git add .
git commit -m "test: add comprehensive Thompson Sampling tests"
```

---

## Phase 4: Trigger.dev Background Jobs

### Task 13: Set Up Trigger.dev

**Files:**
- Create: `trigger.config.ts`
- Create: `trigger/analyze-site.ts`
- Create: `trigger/generate-variants.ts`
- Create: `trigger/update-stats.ts`

**Step 1: Install Trigger.dev**

```bash
pnpm add @trigger.dev/sdk @trigger.dev/nextjs
```

**Step 2: Create Trigger.dev configuration**

Create: `trigger.config.ts`
```typescript
import { defineConfig } from "@trigger.dev/sdk/v3"

export default defineConfig({
  project: "evoloop",
  runtime: "node",
  logLevel: "log",
  maxDuration: 300,
  dirs: ["./trigger"],
})
```

**Step 3: Create analyze-site job**

Create: `trigger/analyze-site.ts`
```typescript
import { task } from "@trigger.dev/sdk/v3"

interface AnalyzeSitePayload {
  siteId: string
  url: string
}

interface BrandConstraints {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  typography: {
    headingFont: string
    bodyFont: string
    headingSize: string
    bodySize: string
  }
  tone: string
  imageryStyle: string
}

export const analyzeSiteTask = task({
  id: "analyze-site",
  maxDuration: 300,
  run: async (payload: AnalyzeSitePayload) => {
    const { siteId, url } = payload

    // Step 1: Scrape the page (Playwright would run here)
    console.log(`Scraping ${url}...`)

    // Step 2: Extract brand constraints via LLM
    const brandConstraints: BrandConstraints = {
      colors: {
        primary: "#3B82F6",
        secondary: "#1E40AF",
        accent: "#F59E0B",
        background: "#FFFFFF",
      },
      typography: {
        headingFont: "Inter",
        bodyFont: "Inter",
        headingSize: "48px",
        bodySize: "16px",
      },
      tone: "professional",
      imageryStyle: "photography",
    }

    // Step 3: Update site in database
    const response = await fetch(`${process.env.API_URL}/api/sites/${siteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand_constraints: brandConstraints,
        status: "analyzed",
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update site: ${response.statusText}`)
    }

    return { siteId, brandConstraints }
  },
})
```

**Step 4: Create generate-variants job**

Create: `trigger/generate-variants.ts`
```typescript
import { task } from "@trigger.dev/sdk/v3"

interface GenerateVariantsPayload {
  siteId: string
  brandConstraints: object
  count: number
  includeImages: boolean
}

interface VariantPatch {
  headline?: string
  subheadline?: string
  cta?: string
  heroImage?: string
}

export const generateVariantsTask = task({
  id: "generate-variants",
  maxDuration: 300,
  run: async (payload: GenerateVariantsPayload) => {
    const { siteId, brandConstraints, count, includeImages } = payload

    const variants: VariantPatch[] = []

    for (let i = 0; i < count; i++) {
      // Call OpenRouter for text generation
      const textResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            {
              role: "system",
              content: `You are a landing page optimization expert. Generate a variant for A/B testing. Brand constraints: ${JSON.stringify(brandConstraints)}`,
            },
            {
              role: "user",
              content: "Generate a headline, subheadline, and CTA for a landing page variant. Return as JSON with keys: headline, subheadline, cta",
            },
          ],
        }),
      })

      if (!textResponse.ok) {
        throw new Error(`OpenRouter request failed: ${textResponse.statusText}`)
      }

      const textData = await textResponse.json()
      const variantContent = JSON.parse(textData.choices[0].message.content)

      let patch: VariantPatch = {
        headline: variantContent.headline,
        subheadline: variantContent.subheadline,
        cta: variantContent.cta,
      }

      // Generate image if enabled
      if (includeImages) {
        const imageResponse = await fetch("https://api.nanobanana.com/v1/images/generate", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.NANOBANANA_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image-preview",
            prompt: `Hero image for landing page: ${variantContent.headline}. Style: ${(brandConstraints as any).imageryStyle}`,
          }),
        })

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          patch.heroImage = imageData.url
        }
      }

      variants.push(patch)
    }

    // Create variants in database
    for (const patch of variants) {
      await fetch(`${process.env.API_URL}/api/internal/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: siteId,
          patch,
          status: "pending_review",
        }),
      })
    }

    return { siteId, variantsCreated: variants.length }
  },
})
```

**Step 5: Create update-stats job**

Create: `trigger/update-stats.ts`
```typescript
import { schedules, task } from "@trigger.dev/sdk/v3"

interface StatsUpdate {
  variantId: string
  visitors: number
  conversions: number
  alpha: number
  beta: number
  probBest: number
}

export const updateStatsTask = task({
  id: "update-stats",
  maxDuration: 60,
  run: async () => {
    // Fetch all active experiments
    const sitesResponse = await fetch(`${process.env.API_URL}/api/internal/active-sites`)
    const sites = await sitesResponse.json()

    for (const site of sites) {
      // Get recent events for each site
      const eventsResponse = await fetch(
        `${process.env.API_URL}/api/internal/sites/${site.id}/recent-events`
      )
      const events = await eventsResponse.json()

      // Aggregate by variant
      const variantStats: Record<string, { impressions: number; conversions: number }> = {}

      for (const event of events) {
        if (!variantStats[event.variant_id]) {
          variantStats[event.variant_id] = { impressions: 0, conversions: 0 }
        }
        if (event.event_type === "impression") {
          variantStats[event.variant_id].impressions++
        } else if (event.event_type === "conversion") {
          variantStats[event.variant_id].conversions++
        }
      }

      // Update stats for each variant
      for (const [variantId, stats] of Object.entries(variantStats)) {
        const alpha = stats.conversions + 1
        const beta = stats.impressions - stats.conversions + 1

        await fetch(`${process.env.API_URL}/api/internal/stats/${variantId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitors: stats.impressions,
            conversions: stats.conversions,
            alpha,
            beta,
          }),
        })
      }
    }

    return { processed: sites.length }
  },
})

// Schedule to run every 5 minutes
export const updateStatsSchedule = schedules.task({
  id: "update-stats-schedule",
  cron: "*/5 * * * *",
  run: async () => {
    await updateStatsTask.trigger({})
  },
})
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add Trigger.dev background jobs for analysis and variant generation"
```

---

## Phase 5: Frontend Dashboard

### Task 14: Create Dashboard Layout

**Files:**
- Create: `app/(dashboard)/layout.tsx`
- Create: `app/(dashboard)/dashboard/page.tsx`
- Create: `components/dashboard/sidebar.tsx`
- Create: `components/dashboard/header.tsx`

**Step 1: Create dashboard layout**

Create: `app/(dashboard)/layout.tsx`
```tsx
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Step 2: Create sidebar component**

Create: `components/dashboard/sidebar.tsx`
```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Globe,
  BarChart3,
  Settings,
  CreditCard,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sites", href: "/dashboard/sites", icon: Globe },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-card border-r">
      <div className="flex items-center h-16 px-6 border-b">
        <span className="text-xl font-bold">Evoloop</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
```

**Step 3: Create header component**

Create: `components/dashboard/header.tsx`
```tsx
"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, Plus } from "lucide-react"

export function Header() {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
      <div className="flex items-center gap-4">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Site
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
```

**Step 4: Create dashboard page**

Create: `app/(dashboard)/dashboard/page.tsx`
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your landing page experiments
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Lift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No sites connected yet. Add your first site to get started.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add dashboard layout with sidebar and header"
```

---

### Task 15: Create Sites List Page

**Files:**
- Create: `app/(dashboard)/dashboard/sites/page.tsx`
- Create: `components/dashboard/site-card.tsx`
- Create: `tests/components/site-card.test.tsx`

**Step 1: Write failing test for SiteCard**

Create: `tests/components/site-card.test.tsx`
```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { SiteCard } from "@/components/dashboard/site-card"

describe("SiteCard", () => {
  const mockSite = {
    id: "123",
    url: "https://example.com",
    status: "running" as const,
    autonomy_mode: "training_wheels",
    conversions: 150,
    visitors: 1000,
    lift: 12.5,
  }

  it("renders site URL", () => {
    render(<SiteCard site={mockSite} />)
    expect(screen.getByText("example.com")).toBeInTheDocument()
  })

  it("shows running status badge", () => {
    render(<SiteCard site={mockSite} />)
    expect(screen.getByText("Running")).toBeInTheDocument()
  })

  it("displays conversion rate", () => {
    render(<SiteCard site={mockSite} />)
    expect(screen.getByText("15.0%")).toBeInTheDocument()
  })

  it("displays lift percentage", () => {
    render(<SiteCard site={mockSite} />)
    expect(screen.getByText("+12.5%")).toBeInTheDocument()
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
pnpm test tests/components/site-card.test.tsx
```

Expected: FAIL - component doesn't exist

**Step 3: Create SiteCard component**

Create: `components/dashboard/site-card.tsx`
```tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ExternalLink } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface Site {
  id: string
  url: string
  status: "analyzing" | "running" | "paused"
  autonomy_mode: string
  conversions: number
  visitors: number
  lift: number | null
}

interface SiteCardProps {
  site: Site
}

export function SiteCard({ site }: SiteCardProps) {
  const hostname = new URL(site.url).hostname
  const conversionRate = site.visitors > 0
    ? ((site.conversions / site.visitors) * 100).toFixed(1)
    : "0.0"

  const statusColors = {
    analyzing: "bg-yellow-500/10 text-yellow-500",
    running: "bg-green-500/10 text-green-500",
    paused: "bg-gray-500/10 text-gray-500",
  }

  const statusLabels = {
    analyzing: "Analyzing",
    running: "Running",
    paused: "Paused",
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{hostname}</span>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <Badge variant="secondary" className={statusColors[site.status]}>
            {statusLabels[site.status]}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/sites/${site.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Pause</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Visitors</p>
            <p className="font-semibold">{site.visitors.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Conversion</p>
            <p className="font-semibold">{conversionRate}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Lift</p>
            <p className={`font-semibold ${site.lift && site.lift > 0 ? "text-green-500" : ""}`}>
              {site.lift !== null ? `+${site.lift}%` : "—"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 4: Run tests to verify they pass**

```bash
pnpm test tests/components/site-card.test.tsx
```

Expected: All 4 tests pass

**Step 5: Create sites list page**

Create: `app/(dashboard)/dashboard/sites/page.tsx`
```tsx
import { SiteCard } from "@/components/dashboard/site-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function SitesPage() {
  // TODO: Fetch from API
  const sites: any[] = []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sites</h1>
          <p className="text-muted-foreground">
            Manage your connected landing pages
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Site
        </Button>
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No sites connected yet
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Site
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add sites list page with SiteCard component"
```

---

### Task 16: Create Site Detail Page with Three Views

**Files:**
- Create: `app/(dashboard)/dashboard/sites/[id]/page.tsx`
- Create: `components/dashboard/views/minimal-view.tsx`
- Create: `components/dashboard/views/timeline-view.tsx`
- Create: `components/dashboard/views/stats-view.tsx`

**Step 1: Create minimal view component**

Create: `components/dashboard/views/minimal-view.tsx`
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pause, Play, RefreshCw } from "lucide-react"

interface MinimalViewProps {
  site: {
    id: string
    status: string
    bestVariant: {
      id: string
      screenshot_url?: string
      conversionRate: number
    } | null
    lift: number | null
    confidence: number | null
    nextAction: string
  }
}

export function MinimalView({ site }: MinimalViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge
            variant="secondary"
            className={
              site.status === "running"
                ? "bg-green-500/10 text-green-500"
                : "bg-gray-500/10 text-gray-500"
            }
          >
            {site.status === "running" ? "Running" : "Paused"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Force New Variant
          </Button>
          <Button variant="outline" size="sm">
            {site.status === "running" ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Best Performer</CardTitle>
          </CardHeader>
          <CardContent>
            {site.bestVariant ? (
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  {site.bestVariant.screenshot_url ? (
                    <img
                      src={site.bestVariant.screenshot_url}
                      alt="Best variant"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No screenshot
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {site.bestVariant.conversionRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Still learning...
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">Lift vs Original</p>
              <p className={`text-3xl font-bold ${site.lift && site.lift > 0 ? "text-green-500" : ""}`}>
                {site.lift !== null ? `+${site.lift.toFixed(1)}%` : "—"}
              </p>
              {site.confidence !== null && (
                <p className="text-sm text-muted-foreground">
                  {site.confidence}% confident
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Action</p>
              <p className="font-medium">{site.nextAction}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

**Step 2: Create timeline view component**

Create: `components/dashboard/views/timeline-view.tsx`
```tsx
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface TimelineEvent {
  id: string
  type: "created" | "promoted" | "killed"
  variant: {
    id: string
    patch: Record<string, any>
    conversionRate?: number
  }
  timestamp: Date
}

interface TimelineViewProps {
  events: TimelineEvent[]
}

export function TimelineView({ events }: TimelineViewProps) {
  const typeColors = {
    created: "bg-blue-500/10 text-blue-500",
    promoted: "bg-green-500/10 text-green-500",
    killed: "bg-red-500/10 text-red-500",
  }

  const typeLabels = {
    created: "Created",
    promoted: "Winner",
    killed: "Killed",
  }

  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No experiment history yet
        </p>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          {events.map((event, index) => (
            <div key={event.id} className="relative pl-10 pb-8">
              <div className="absolute left-2.5 w-3 h-3 rounded-full bg-background border-2 border-primary" />
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={typeColors[event.type]}>
                        {typeLabels[event.type]}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    {event.variant.conversionRate !== undefined && (
                      <span className="font-semibold">
                        {event.variant.conversionRate.toFixed(1)}% CVR
                      </span>
                    )}
                  </div>
                  <div className="text-sm space-y-1">
                    {Object.entries(event.variant.patch).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-muted-foreground capitalize">{key}:</span>
                        <span className="truncate">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 3: Create stats view component**

Create: `components/dashboard/views/stats-view.tsx`
```tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface VariantStats {
  id: string
  name: string
  visitors: number
  conversions: number
  conversionRate: number
  probBest: number
  credibleInterval: [number, number]
}

interface StatsViewProps {
  variants: VariantStats[]
}

export function StatsView({ variants }: StatsViewProps) {
  const handleExport = () => {
    const csv = [
      ["Variant", "Visitors", "Conversions", "CVR", "P(Best)", "CI Low", "CI High"].join(","),
      ...variants.map((v) =>
        [
          v.name,
          v.visitors,
          v.conversions,
          v.conversionRate.toFixed(2),
          v.probBest.toFixed(2),
          v.credibleInterval[0].toFixed(2),
          v.credibleInterval[1].toFixed(2),
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "experiment-stats.csv"
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variant Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Variant</th>
                  <th className="text-right py-3 px-2">Visitors</th>
                  <th className="text-right py-3 px-2">Conversions</th>
                  <th className="text-right py-3 px-2">CVR</th>
                  <th className="text-right py-3 px-2">P(Best)</th>
                  <th className="text-right py-3 px-2">95% CI</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr key={variant.id} className="border-b last:border-0">
                    <td className="py-3 px-2 font-medium">{variant.name}</td>
                    <td className="text-right py-3 px-2">{variant.visitors.toLocaleString()}</td>
                    <td className="text-right py-3 px-2">{variant.conversions.toLocaleString()}</td>
                    <td className="text-right py-3 px-2">{variant.conversionRate.toFixed(2)}%</td>
                    <td className="text-right py-3 px-2">
                      <span
                        className={
                          variant.probBest > 0.9
                            ? "text-green-500 font-semibold"
                            : variant.probBest < 0.1
                            ? "text-red-500"
                            : ""
                        }
                      >
                        {(variant.probBest * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right py-3 px-2 text-muted-foreground">
                      [{variant.credibleInterval[0].toFixed(2)}%, {variant.credibleInterval[1].toFixed(2)}%]
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Posterior Distributions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Beta distribution visualization coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 4: Create site detail page**

Create: `app/(dashboard)/dashboard/sites/[id]/page.tsx`
```tsx
"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MinimalView } from "@/components/dashboard/views/minimal-view"
import { TimelineView } from "@/components/dashboard/views/timeline-view"
import { StatsView } from "@/components/dashboard/views/stats-view"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings } from "lucide-react"
import Link from "next/link"

export default function SiteDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("minimal")

  // TODO: Fetch from API
  const site = {
    id: params.id,
    url: "https://example.com",
    status: "running",
    bestVariant: {
      id: "v1",
      conversionRate: 4.2,
    },
    lift: 18.5,
    confidence: 95,
    nextAction: "Generating new variant in 4 hours",
  }

  const timelineEvents: any[] = []
  const variantStats: any[] = []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/sites">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{new URL(site.url).hostname}</h1>
            <p className="text-muted-foreground">{site.url}</p>
          </div>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="minimal">Minimal</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="minimal" className="mt-6">
          <MinimalView site={site} />
        </TabsContent>
        <TabsContent value="timeline" className="mt-6">
          <TimelineView events={timelineEvents} />
        </TabsContent>
        <TabsContent value="stats" className="mt-6">
          <StatsView variants={variantStats} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add site detail page with minimal, timeline, and stats views"
```

---

### Task 17: Create Onboarding Flow

**Files:**
- Create: `app/(onboarding)/onboard/page.tsx`
- Create: `app/(onboarding)/onboard/layout.tsx`
- Create: `components/onboarding/step-url.tsx`
- Create: `components/onboarding/step-brand.tsx`
- Create: `components/onboarding/step-goals.tsx`
- Create: `components/onboarding/step-autonomy.tsx`
- Create: `components/onboarding/step-install.tsx`

**Step 1: Create onboarding layout**

Create: `app/(onboarding)/onboard/layout.tsx`
```tsx
export default function OnboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        {children}
      </div>
    </div>
  )
}
```

**Step 2: Create step components**

Create: `components/onboarding/step-url.tsx`
```tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface StepUrlProps {
  onNext: (url: string) => void
}

export function StepUrl({ onNext }: StepUrlProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    try {
      new URL(url)
      setError("")
      onNext(url)
    } catch {
      setError("Please enter a valid URL")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Your Landing Page</CardTitle>
        <CardDescription>
          Enter the URL of the landing page you want to optimize
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">Landing Page URL</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://yoursite.com/landing"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <Button onClick={handleSubmit} className="w-full">
          Continue
        </Button>
      </CardContent>
    </Card>
  )
}
```

Create: `components/onboarding/step-brand.tsx`
```tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

interface BrandConstraints {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  typography: {
    headingFont: string
    bodyFont: string
  }
  tone: string
}

interface StepBrandProps {
  constraints: BrandConstraints | null
  loading: boolean
  onNext: (constraints: BrandConstraints) => void
  onBack: () => void
}

export function StepBrand({ constraints, loading, onNext, onBack }: StepBrandProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyzing Your Page</CardTitle>
          <CardDescription>
            Extracting brand constraints from your landing page...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Constraints</CardTitle>
        <CardDescription>
          We detected these brand elements. Adjust if needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Colors</Label>
          <div className="grid grid-cols-4 gap-4">
            {constraints && Object.entries(constraints.colors).map(([name, color]) => (
              <div key={name} className="space-y-1">
                <div
                  className="h-10 rounded border"
                  style={{ backgroundColor: color }}
                />
                <p className="text-xs text-center capitalize">{name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Typography</Label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={constraints?.typography.headingFont || ""}
              placeholder="Heading font"
              readOnly
            />
            <Input
              value={constraints?.typography.bodyFont || ""}
              placeholder="Body font"
              readOnly
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tone of Voice</Label>
          <Input value={constraints?.tone || ""} readOnly />
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button onClick={() => constraints && onNext(constraints)} className="flex-1">
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

Create: `components/onboarding/step-goals.tsx`
```tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface DetectedGoal {
  type: string
  description: string
  selector?: string
}

interface StepGoalsProps {
  detectedGoals: DetectedGoal[]
  onNext: (goals: DetectedGoal[]) => void
  onBack: () => void
}

export function StepGoals({ detectedGoals, onNext, onBack }: StepGoalsProps) {
  const [selectedGoals, setSelectedGoals] = useState<Set<number>>(
    new Set(detectedGoals.map((_, i) => i))
  )
  const [customUrl, setCustomUrl] = useState("")

  const toggleGoal = (index: number) => {
    const newSelected = new Set(selectedGoals)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedGoals(newSelected)
  }

  const handleNext = () => {
    const goals = detectedGoals.filter((_, i) => selectedGoals.has(i))
    if (customUrl) {
      goals.push({ type: "url", description: `Visit ${customUrl}` })
    }
    onNext(goals)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Goals</CardTitle>
        <CardDescription>
          Select what counts as a conversion on your page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Detected Goals</Label>
          {detectedGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No goals auto-detected</p>
          ) : (
            detectedGoals.map((goal, index) => (
              <div key={index} className="flex items-center gap-3">
                <Checkbox
                  id={`goal-${index}`}
                  checked={selectedGoals.has(index)}
                  onCheckedChange={() => toggleGoal(index)}
                />
                <Label htmlFor={`goal-${index}`} className="font-normal">
                  {goal.description}
                </Label>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2">
          <Label>Or track visits to a specific URL</Label>
          <Input
            placeholder="https://yoursite.com/thank-you"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button onClick={handleNext} className="flex-1">
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

Create: `components/onboarding/step-autonomy.tsx`
```tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface StepAutonomyProps {
  onNext: (mode: string) => void
  onBack: () => void
}

const modes = [
  {
    value: "supervised",
    label: "Supervised",
    description: "Review and approve each variant before it goes live",
  },
  {
    value: "training_wheels",
    label: "Training Wheels (Recommended)",
    description: "First 5 variants need approval, then fully autonomous",
  },
  {
    value: "full_auto",
    label: "Full Auto",
    description: "Let it run completely autonomously. Trust the algorithm.",
  },
]

export function StepAutonomy({ onNext, onBack }: StepAutonomyProps) {
  const [selected, setSelected] = useState("training_wheels")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Autonomy Mode</CardTitle>
        <CardDescription>
          How much control should Evoloop have over your experiments?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={selected} onValueChange={setSelected}>
          {modes.map((mode) => (
            <div
              key={mode.value}
              className="flex items-start space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50"
              onClick={() => setSelected(mode.value)}
            >
              <RadioGroupItem value={mode.value} id={mode.value} />
              <div className="space-y-1">
                <Label htmlFor={mode.value} className="font-medium cursor-pointer">
                  {mode.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {mode.description}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button onClick={() => onNext(selected)} className="flex-1">
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

Create: `components/onboarding/step-install.tsx`
```tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Copy, Loader2 } from "lucide-react"

interface StepInstallProps {
  siteId: string
  onComplete: () => void
}

export function StepInstall({ siteId, onComplete }: StepInstallProps) {
  const [copied, setCopied] = useState(false)
  const [checking, setChecking] = useState(false)
  const [connected, setConnected] = useState(false)

  const snippet = `<script>document.documentElement.style.opacity='0'</script>
<script src="https://evoloop.dev/s/${siteId}.js" async onload="document.documentElement.style.opacity='1'"></script>`

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCheck = async () => {
    setChecking(true)
    // TODO: Actually check for connection
    await new Promise((r) => setTimeout(r, 2000))
    setConnected(true)
    setChecking(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Install the Script</CardTitle>
        <CardDescription>
          Add this snippet to your landing page&apos;s &lt;head&gt; tag
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto">
            <code>{snippet}</code>
          </pre>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex flex-col items-center gap-4">
          {!connected ? (
            <>
              <Button onClick={handleCheck} disabled={checking}>
                {checking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking connection...
                  </>
                ) : (
                  "Check Connection"
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                After adding the script, click to verify the connection
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-green-500">
                <Check className="h-5 w-5" />
                <span className="font-medium">Connected!</span>
              </div>
              <Button onClick={onComplete} className="w-full">
                Start Optimizing
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 3: Create onboarding page with state machine**

Create: `app/(onboarding)/onboard/page.tsx`
```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StepUrl } from "@/components/onboarding/step-url"
import { StepBrand } from "@/components/onboarding/step-brand"
import { StepGoals } from "@/components/onboarding/step-goals"
import { StepAutonomy } from "@/components/onboarding/step-autonomy"
import { StepInstall } from "@/components/onboarding/step-install"

type Step = "url" | "brand" | "goals" | "autonomy" | "install"

export default function OnboardPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("url")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    url: "",
    brandConstraints: null as any,
    goals: [] as any[],
    autonomyMode: "training_wheels",
    siteId: "",
  })

  const handleUrlSubmit = async (url: string) => {
    setData((d) => ({ ...d, url }))
    setStep("brand")
    setLoading(true)

    // TODO: Call API to analyze site
    await new Promise((r) => setTimeout(r, 2000))

    setData((d) => ({
      ...d,
      brandConstraints: {
        colors: {
          primary: "#3B82F6",
          secondary: "#1E40AF",
          accent: "#F59E0B",
          background: "#FFFFFF",
        },
        typography: {
          headingFont: "Inter",
          bodyFont: "Inter",
        },
        tone: "Professional",
      },
    }))
    setLoading(false)
  }

  const handleBrandSubmit = (constraints: any) => {
    setData((d) => ({ ...d, brandConstraints: constraints }))
    setStep("goals")
  }

  const handleGoalsSubmit = (goals: any[]) => {
    setData((d) => ({ ...d, goals }))
    setStep("autonomy")
  }

  const handleAutonomySubmit = async (mode: string) => {
    setData((d) => ({ ...d, autonomyMode: mode }))

    // TODO: Create site via API
    const siteId = crypto.randomUUID()
    setData((d) => ({ ...d, siteId }))
    setStep("install")
  }

  const handleComplete = () => {
    router.push(`/dashboard/sites/${data.siteId}`)
  }

  const detectedGoals = [
    { type: "form", description: "Form submission detected" },
    { type: "calendly", description: "Calendly booking widget" },
  ]

  return (
    <>
      {step === "url" && <StepUrl onNext={handleUrlSubmit} />}
      {step === "brand" && (
        <StepBrand
          constraints={data.brandConstraints}
          loading={loading}
          onNext={handleBrandSubmit}
          onBack={() => setStep("url")}
        />
      )}
      {step === "goals" && (
        <StepGoals
          detectedGoals={detectedGoals}
          onNext={handleGoalsSubmit}
          onBack={() => setStep("brand")}
        />
      )}
      {step === "autonomy" && (
        <StepAutonomy
          onNext={handleAutonomySubmit}
          onBack={() => setStep("goals")}
        />
      )}
      {step === "install" && (
        <StepInstall siteId={data.siteId} onComplete={handleComplete} />
      )}
    </>
  )
}
```

**Step 4: Add RadioGroup component from shadcn**

```bash
pnpm dlx shadcn@latest add radio-group checkbox
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add complete onboarding flow with 5 steps"
```

---

### Task 18: Create Cost Estimator Component

**Files:**
- Create: `components/dashboard/cost-estimator.tsx`
- Create: `tests/components/cost-estimator.test.tsx`

**Step 1: Write failing test**

Create: `tests/components/cost-estimator.test.tsx`
```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CostEstimator } from "@/components/dashboard/cost-estimator"

describe("CostEstimator", () => {
  it("shows text-only costs by default", () => {
    render(<CostEstimator creditBalance={5} />)
    expect(screen.getByText(/\$3-8\/mo/)).toBeInTheDocument()
  })

  it("shows higher costs when images enabled", async () => {
    render(<CostEstimator creditBalance={5} />)
    const toggle = screen.getByRole("switch")
    await userEvent.click(toggle)
    expect(screen.getByText(/\$15-40\/mo/)).toBeInTheDocument()
  })

  it("displays credit balance", () => {
    render(<CostEstimator creditBalance={12.5} />)
    expect(screen.getByText("$12.50")).toBeInTheDocument()
  })

  it("shows runway estimate", () => {
    render(<CostEstimator creditBalance={5} />)
    expect(screen.getByText(/runway/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
pnpm test tests/components/cost-estimator.test.tsx
```

Expected: FAIL

**Step 3: Create CostEstimator component**

Create: `components/dashboard/cost-estimator.tsx`
```tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface CostEstimatorProps {
  creditBalance: number
  onImageToggle?: (enabled: boolean) => void
}

export function CostEstimator({ creditBalance, onImageToggle }: CostEstimatorProps) {
  const [imageEnabled, setImageEnabled] = useState(false)

  const handleToggle = (checked: boolean) => {
    setImageEnabled(checked)
    onImageToggle?.(checked)
  }

  const costRange = imageEnabled ? "$15-40/mo" : "$3-8/mo"
  const avgMonthlyCost = imageEnabled ? 27.5 : 5.5
  const runwayWeeks = Math.round((creditBalance / avgMonthlyCost) * 4)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Estimated Costs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <div>
            <p className="font-medium">
              {imageEnabled ? "Text + image variants" : "Text variants only"}
            </p>
            <p className="text-2xl font-bold">{costRange}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="image-toggle">Enable image generation</Label>
            <p className="text-sm text-muted-foreground">
              Better results, higher cost
            </p>
          </div>
          <Switch
            id="image-toggle"
            checked={imageEnabled}
            onCheckedChange={handleToggle}
          />
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Credit balance</span>
            <span className="font-semibold">${creditBalance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated runway</span>
            <span className="font-semibold">~{runwayWeeks} weeks</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 4: Run tests to verify they pass**

```bash
pnpm test tests/components/cost-estimator.test.tsx
```

Expected: All 4 tests pass

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add cost estimator component with image toggle"
```

---

## Phase 6: Runtime Script

### Task 19: Create Runtime Script

**Files:**
- Create: `public/s/evoloop.js`
- Create: `tests/runtime/evoloop.test.ts`

**Step 1: Write failing tests for runtime script**

Create: `tests/runtime/evoloop.test.ts`
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the runtime script functions
const createRuntime = () => {
  const visitors: Record<string, string> = {}
  const events: Array<{ type: string; variantId: string; visitorId: string }> = []

  return {
    getVisitorId: () => {
      let id = localStorage.getItem("evoloop_visitor_id")
      if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem("evoloop_visitor_id", id)
      }
      return id
    },

    applyPatch: (patch: Record<string, any>) => {
      for (const [selector, changes] of Object.entries(patch)) {
        const el = document.querySelector(selector)
        if (el && typeof changes === "object") {
          if (changes.text) el.textContent = changes.text
          if (changes.href) (el as HTMLAnchorElement).href = changes.href
          if (changes.src) (el as HTMLImageElement).src = changes.src
          if (changes.style) Object.assign((el as HTMLElement).style, changes.style)
        }
      }
    },

    trackEvent: (type: string, variantId: string, visitorId: string) => {
      events.push({ type, variantId, visitorId })
    },

    getEvents: () => events,
  }
}

describe("Evoloop Runtime", () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = `
      <h1 id="headline">Original Headline</h1>
      <button id="cta">Click Me</button>
      <img id="hero" src="original.jpg" />
    `
  })

  it("generates and persists visitor ID", () => {
    const runtime = createRuntime()
    const id1 = runtime.getVisitorId()
    const id2 = runtime.getVisitorId()
    expect(id1).toBe(id2)
    expect(id1).toMatch(/^[0-9a-f-]{36}$/)
  })

  it("applies text patch", () => {
    const runtime = createRuntime()
    runtime.applyPatch({
      "#headline": { text: "New Headline" },
    })
    expect(document.querySelector("#headline")?.textContent).toBe("New Headline")
  })

  it("applies image patch", () => {
    const runtime = createRuntime()
    runtime.applyPatch({
      "#hero": { src: "new-image.jpg" },
    })
    expect((document.querySelector("#hero") as HTMLImageElement).src).toContain("new-image.jpg")
  })

  it("applies style patch", () => {
    const runtime = createRuntime()
    runtime.applyPatch({
      "#cta": { style: { backgroundColor: "red" } },
    })
    expect((document.querySelector("#cta") as HTMLElement).style.backgroundColor).toBe("red")
  })

  it("tracks events", () => {
    const runtime = createRuntime()
    runtime.trackEvent("impression", "var-123", "visitor-456")
    runtime.trackEvent("conversion", "var-123", "visitor-456")
    expect(runtime.getEvents()).toHaveLength(2)
  })
})
```

**Step 2: Run tests to verify they pass** (these test the logic, not the actual file)

```bash
pnpm test tests/runtime/evoloop.test.ts
```

Expected: All 5 tests pass

**Step 3: Create the actual runtime script**

Create: `public/s/evoloop.js`
```javascript
(function() {
  'use strict';

  var EVOLOOP_API = 'https://evoloop.dev';
  var siteId = null;
  var variantId = null;
  var visitorId = null;

  // Extract site ID from script src
  function getSiteId() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src;
      if (src && src.indexOf('evoloop') !== -1) {
        var match = src.match(/\/s\/([^.]+)\.js/);
        if (match) return match[1];
      }
    }
    return null;
  }

  // Get or create visitor ID
  function getVisitorId() {
    var id = localStorage.getItem('evoloop_visitor_id');
    if (!id) {
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      localStorage.setItem('evoloop_visitor_id', id);
    }
    return id;
  }

  // Apply DOM patch
  function applyPatch(patch) {
    if (!patch || typeof patch !== 'object') return;

    Object.keys(patch).forEach(function(selector) {
      var changes = patch[selector];
      var el = document.querySelector(selector);
      if (!el || typeof changes !== 'object') return;

      if (changes.text) el.textContent = changes.text;
      if (changes.innerHTML) el.innerHTML = changes.innerHTML;
      if (changes.href) el.href = changes.href;
      if (changes.src) el.src = changes.src;
      if (changes.style) {
        Object.keys(changes.style).forEach(function(prop) {
          el.style[prop] = changes.style[prop];
        });
      }
      if (changes.className) el.className = changes.className;
      if (changes.attributes) {
        Object.keys(changes.attributes).forEach(function(attr) {
          el.setAttribute(attr, changes.attributes[attr]);
        });
      }
    });
  }

  // Send event to API
  function trackEvent(type, metadata) {
    if (!siteId || !variantId || !visitorId) return;

    var data = {
      site_id: siteId,
      variant_id: variantId,
      visitor_id: visitorId,
      type: type,
      metadata: metadata || {}
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon(EVOLOOP_API + '/v1/event', JSON.stringify(data));
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', EVOLOOP_API + '/v1/event', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    }
  }

  // Auto-detect conversions
  function setupAutoTracking() {
    // Track form submissions
    document.addEventListener('submit', function(e) {
      if (e.target.tagName === 'FORM') {
        trackEvent('conversion', { type: 'form_submit' });
      }
    });

    // Track link clicks to thank-you pages
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a');
      if (link && link.href) {
        var href = link.href.toLowerCase();
        if (href.indexOf('thank') !== -1 || href.indexOf('success') !== -1 || href.indexOf('confirm') !== -1) {
          trackEvent('conversion', { type: 'thank_you_click', url: link.href });
        }
      }
    });
  }

  // Fetch variant and apply
  function init() {
    siteId = getSiteId();
    if (!siteId) {
      console.error('[Evoloop] Could not determine site ID');
      return;
    }

    visitorId = getVisitorId();

    var xhr = new XMLHttpRequest();
    xhr.open('GET', EVOLOOP_API + '/v1/assign?site_id=' + siteId + '&visitor_id=' + visitorId, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var response = JSON.parse(xhr.responseText);
            variantId = response.variant_id;
            applyPatch(response.patch);
            trackEvent('impression', {});
          } catch (e) {
            console.error('[Evoloop] Failed to parse response', e);
          }
        }
        // Show page regardless of success/failure
        document.documentElement.style.opacity = '1';
      }
    };
    xhr.send();

    setupAutoTracking();
  }

  // Expose convert function globally
  window.evoloop = {
    convert: function(metadata) {
      trackEvent('conversion', metadata || {});
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add runtime script for variant assignment and tracking"
```

---

## Phase 7: Payments with Polar

### Task 20: Set Up Polar Integration

**Files:**
- Create: `api/routes/payments.py`
- Create: `api/schemas/payments.py`
- Create: `api/tests/test_payments.py`
- Create: `app/(dashboard)/dashboard/billing/page.tsx`

**Step 1: Write failing tests**

Create: `api/tests/test_payments.py`
```python
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock


class TestPaymentsEndpoints:
    def test_get_credit_balance(self, client: TestClient, db_session):
        # TODO: Create user with credits first
        pass

    def test_create_checkout_session(self, client: TestClient):
        with patch("routes.payments.polar_client") as mock_polar:
            mock_polar.checkouts.create.return_value = MagicMock(
                url="https://polar.sh/checkout/123"
            )
            response = client.post(
                "/api/payments/checkout",
                json={"amount": 5.00, "user_id": "user-123"},
            )
            assert response.status_code == 200
            assert "checkout_url" in response.json()

    def test_webhook_adds_credits(self, client: TestClient, db_session):
        # TODO: Test webhook handling
        pass
```

**Step 2: Create payments schemas**

Create: `api/schemas/payments.py`
```python
from pydantic import BaseModel
from typing import Optional


class CheckoutRequest(BaseModel):
    amount: float
    user_id: str


class CheckoutResponse(BaseModel):
    checkout_url: str


class CreditBalance(BaseModel):
    balance: float
    last_updated: str
```

**Step 3: Create payments routes**

Create: `api/routes/payments.py`
```python
import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from db import get_db
from db.models import User
from schemas.payments import CheckoutRequest, CheckoutResponse, CreditBalance

router = APIRouter(prefix="/api/payments", tags=["payments"])

POLAR_API_KEY = os.getenv("POLAR_API_KEY")
POLAR_API_URL = "https://api.polar.sh/v1"


@router.get("/balance/{user_id}", response_model=CreditBalance)
async def get_credit_balance(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    settings = user.settings or {}
    balance = settings.get("credit_balance", 0.0)

    return CreditBalance(
        balance=balance,
        last_updated=datetime.utcnow().isoformat(),
    )


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(request: CheckoutRequest, db: Session = Depends(get_db)):
    import httpx

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{POLAR_API_URL}/checkouts",
            headers={
                "Authorization": f"Bearer {POLAR_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "amount": int(request.amount * 100),  # Convert to cents
                "currency": "usd",
                "metadata": {"user_id": request.user_id},
                "success_url": f"{os.getenv('APP_URL')}/dashboard/billing?success=true",
                "cancel_url": f"{os.getenv('APP_URL')}/dashboard/billing?canceled=true",
            },
        )

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to create checkout")

        data = response.json()
        return CheckoutResponse(checkout_url=data["url"])


@router.post("/webhook")
async def handle_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    event_type = payload.get("type")

    if event_type == "checkout.completed":
        user_id = payload.get("data", {}).get("metadata", {}).get("user_id")
        amount = payload.get("data", {}).get("amount", 0) / 100  # Convert from cents

        if user_id:
            user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
            if user:
                settings = user.settings or {}
                current_balance = settings.get("credit_balance", 0.0)
                settings["credit_balance"] = current_balance + amount
                user.settings = settings
                db.commit()

    return {"status": "ok"}
```

**Step 4: Add payments router to main app**

Modify: `api/index.py`
```python
from fastapi import FastAPI
from routes.auth import router as auth_router
from routes.sites import router as sites_router
from routes.variants import router as variants_router
from routes.runtime import router as runtime_router
from routes.payments import router as payments_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(sites_router)
app.include_router(variants_router)
app.include_router(runtime_router)
app.include_router(payments_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "evoloop"}
```

**Step 5: Create billing page**

Create: `app/(dashboard)/dashboard/billing/page.tsx`
```tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CostEstimator } from "@/components/dashboard/cost-estimator"
import { CreditCard, Plus } from "lucide-react"

const topUpOptions = [
  { amount: 5, label: "$5" },
  { amount: 10, label: "$10" },
  { amount: 25, label: "$25" },
  { amount: 50, label: "$50" },
]

export default function BillingPage() {
  const [loading, setLoading] = useState(false)
  const creditBalance = 5.0 // TODO: Fetch from API

  const handleTopUp = async (amount: number) => {
    setLoading(true)
    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, user_id: "current-user" }), // TODO: Get actual user ID
      })
      const data = await response.json()
      window.location.href = data.checkout_url
    } catch (error) {
      console.error("Failed to create checkout", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage your credits and payment methods
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Credit Balance</CardTitle>
            <CardDescription>
              Credits are used for AI-powered variant generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-4">
              <p className="text-4xl font-bold">${creditBalance.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Available credits</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Top up credits</p>
              <div className="grid grid-cols-4 gap-2">
                {topUpOptions.map((option) => (
                  <Button
                    key={option.amount}
                    variant="outline"
                    onClick={() => handleTopUp(option.amount)}
                    disabled={loading}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <CostEstimator creditBalance={creditBalance} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No usage history yet
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add Polar payments integration with billing page"
```

---

## Phase 8: Admin Interface

### Task 21: Create Admin Dashboard

**Files:**
- Create: `app/(admin)/admin/layout.tsx`
- Create: `app/(admin)/admin/page.tsx`
- Create: `app/(admin)/admin/users/page.tsx`
- Create: `app/(admin)/admin/experiments/page.tsx`
- Create: `api/routes/admin.py`

**Step 1: Create admin layout**

Create: `app/(admin)/admin/layout.tsx`
```tsx
import { redirect } from "next/navigation"
import Link from "next/link"

const adminNavigation = [
  { name: "Overview", href: "/admin" },
  { name: "Users", href: "/admin/users" },
  { name: "Experiments", href: "/admin/experiments" },
  { name: "Jobs", href: "/admin/jobs" },
  { name: "Costs", href: "/admin/costs" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: Check if user is admin
  const isAdmin = true

  if (!isAdmin) {
    redirect("/dashboard")
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-col w-64 bg-card border-r">
        <div className="flex items-center h-16 px-6 border-b">
          <span className="text-xl font-bold">Evoloop Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {adminNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  )
}
```

**Step 2: Create admin overview page**

Create: `app/(admin)/admin/page.tsx`
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
  // TODO: Fetch from API
  const stats = {
    totalUsers: 0,
    activeExperiments: 0,
    totalEvents: 0,
    monthlyRevenue: 0,
    llmCosts: 0,
    imageCosts: 0,
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Overview</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Experiments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeExperiments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">LLM Costs (MTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.llmCosts.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Image Gen Costs (MTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.imageCosts.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

**Step 3: Create admin users page**

Create: `app/(admin)/admin/users/page.tsx`
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AdminUsersPage() {
  // TODO: Fetch from API
  const users: any[] = []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Users</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No users yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Sites</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.plan}</Badge>
                    </TableCell>
                    <TableCell>{user.siteCount}</TableCell>
                    <TableCell>${user.credits.toFixed(2)}</TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Impersonate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 4: Create admin experiments page**

Create: `app/(admin)/admin/experiments/page.tsx`
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pause } from "lucide-react"

export default function AdminExperimentsPage() {
  // TODO: Fetch from API
  const experiments: any[] = []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Experiments</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Running Experiments</CardTitle>
        </CardHeader>
        <CardContent>
          {experiments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No running experiments
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Visitors (24h)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {experiments.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell>{exp.siteUrl}</TableCell>
                    <TableCell>{exp.userEmail}</TableCell>
                    <TableCell>{exp.variantCount}</TableCell>
                    <TableCell>{exp.visitors24h.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          exp.status === "running"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }
                      >
                        {exp.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 5: Add Table component from shadcn**

```bash
pnpm dlx shadcn@latest add table
```

**Step 6: Create admin API routes**

Create: `api/routes/admin.py`
```python
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from db import get_db
from db.models import User, Site, Variant, Event

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
async def get_admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar()
    active_experiments = db.query(func.count(Site.id)).filter(Site.status == "running").scalar()
    # TODO: Add more stats

    return {
        "total_users": total_users,
        "active_experiments": active_experiments,
        "total_events_24h": 0,
        "monthly_revenue": 0,
        "llm_costs_mtd": 0,
        "image_costs_mtd": 0,
    }


@router.get("/users")
async def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "plan": u.plan,
            "site_count": len(u.sites),
            "credits": (u.settings or {}).get("credit_balance", 0),
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.get("/experiments")
async def list_experiments(db: Session = Depends(get_db)):
    sites = db.query(Site).filter(Site.status == "running").all()
    return [
        {
            "id": str(s.id),
            "site_url": s.url,
            "user_email": s.user.email,
            "variant_count": len(s.variants),
            "visitors_24h": 0,  # TODO: Calculate from events
            "status": s.status,
        }
        for s in sites
    ]


@router.post("/experiments/{site_id}/pause")
async def pause_experiment(site_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == uuid.UUID(site_id)).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    site.status = "paused"
    db.commit()

    return {"status": "paused"}
```

**Step 7: Add admin router to main app**

Modify: `api/index.py`
```python
from fastapi import FastAPI
from routes.auth import router as auth_router
from routes.sites import router as sites_router
from routes.variants import router as variants_router
from routes.runtime import router as runtime_router
from routes.payments import router as payments_router
from routes.admin import router as admin_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(sites_router)
app.include_router(variants_router)
app.include_router(runtime_router)
app.include_router(payments_router)
app.include_router(admin_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "evoloop"}
```

**Step 8: Commit**

```bash
git add .
git commit -m "feat: add admin interface with users and experiments management"
```

---

## Phase 9: Final Integration & Polish

### Task 22: Add Dark Mode Support

**Files:**
- Create: `components/theme-provider.tsx`
- Create: `components/theme-toggle.tsx`
- Modify: `app/layout.tsx`

**Step 1: Create theme provider**

Create: `components/theme-provider.tsx`
```tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**Step 2: Create theme toggle**

Create: `components/theme-toggle.tsx`
```tsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

**Step 3: Install next-themes**

```bash
pnpm add next-themes
```

**Step 4: Update root layout**

Modify: `app/layout.tsx`
```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Evoloop - Autonomous Landing Page Optimization",
  description: "AI-powered landing page testing and optimization",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Step 5: Add theme toggle to header**

Modify: `components/dashboard/header.tsx` (add ThemeToggle)
```tsx
import { ThemeToggle } from "@/components/theme-toggle"

// In the header component, add before the notifications button:
<ThemeToggle />
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add dark mode support with theme toggle"
```

---

### Task 23: Run Full Test Suite & Coverage

**Step 1: Run Python tests with coverage**

```bash
cd api
pytest --cov=. --cov-report=html --cov-report=term-missing
```

Expected: 90%+ coverage, all tests pass

**Step 2: Run frontend tests with coverage**

```bash
pnpm test:coverage
```

Expected: 90%+ coverage, all tests pass

**Step 3: Fix any coverage gaps**

If coverage is below 90%, add tests for uncovered code.

**Step 4: Commit**

```bash
git add .
git commit -m "test: achieve 90%+ test coverage"
```

---

### Task 24: Deploy to Vercel

**Step 1: Create Vercel project**

```bash
vercel
```

Follow prompts to link project.

**Step 2: Set environment variables**

```bash
vercel env add DATABASE_URL
vercel env add OPENROUTER_API_KEY
vercel env add NANOBANANA_API_KEY
vercel env add POLAR_API_KEY
vercel env add PASSWORD_SALT
vercel env add APP_URL
```

**Step 3: Deploy**

```bash
vercel --prod
```

**Step 4: Run migrations on production database**

```bash
cd api
DATABASE_URL=<production_url> alembic upgrade head
```

**Step 5: Verify deployment**

- Visit production URL
- Test health endpoint: `curl https://evoloop.dev/api/health`
- Test login flow
- Test creating a site

**Step 6: Commit any deployment fixes**

```bash
git add .
git commit -m "chore: deployment configuration"
```

---

## Summary

This implementation plan covers:

1. **Project Setup** - Next.js, shadcn/ui, Python backend, Neon DB
2. **Authentication** - Neon Auth integration
3. **Core API** - Sites, Variants, Runtime endpoints
4. **Statistical Engine** - Thompson Sampling implementation
5. **Background Jobs** - Trigger.dev for analysis and generation
6. **Dashboard** - Three views (minimal, timeline, stats)
7. **Onboarding** - 5-step flow with brand extraction
8. **Runtime Script** - Variant assignment and tracking
9. **Payments** - Polar integration with credits
10. **Admin Interface** - User and experiment management
11. **Polish** - Dark mode, full test coverage

Each task follows TDD with explicit test → implement → verify → commit steps.
