# Arealis Magnus Platform

## Table of Contents
- [Overview](#overview)
- [Feature Highlights](#feature-highlights)
  - [Unified Intelligence Dashboard](#unified-intelligence-dashboard)
  - [Data Ingestion Hub](#data-ingestion-hub)
  - [Backend Agent Pipeline](#backend-agent-pipeline)
  - [Explainability & FAISS Integration](#explainability--faiss-integration)
  - [Client Portal](#client-portal)
- [Architecture Overview](#architecture-overview)
- [Repository Layout](#repository-layout)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Backend (FastAPI)](#backend-fastapi)
  - [Main Dashboard (Nextjs)](#main-dashboard-nextjs)
  - [Data Ingestion Experience](#data-ingestion-experience)
  - [Client Portal](#client-portal-1)
- [Environment Variables](#environment-variables)
- [Running the Test Suite](#running-the-test-suite)
- [Sample Data & Utilities](#sample-data--utilities)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

Arealis Magnus is a full-stack payments intelligence platform designed for fintech ops teams. The monorepo combines:

- A real-time operational dashboard with multi-agent analytics.
- A data ingestion experience for CSV uploads and live bank API connections.
- A FastAPI backend that validates data, orchestrates compliance/fraud/routing/explainability agents, and surfaces summaries over SQLite.
- A dedicated client portal (optional deployment) for external stakeholders.

The platform is intentionally opinionated with rich UI scaffolding and robust backend defaults so teams can plug in real APIs, models, and data sources with minimal lift.

## Feature Highlights

### Unified Intelligence Dashboard
- Eleven curated sections (*Overview, Compliance, Fraud, Routing, Settlement, Reconciliation, Multibanker, Audit Ledger, Explainability, Settings, Integrations*) rendered with shadcn/ui primitives (`components/dashboard/sections`).
- Live data wiring via `DashboardDataProvider` to `/api/v1/dashboard/{session_id}` (see `Client/components/dashboard/providers/dashboard-data-context.tsx`).
- Contextual status badges, risk visualizations, routing recommendations, and explainability insights backed by summary helpers in `Server/app/services/dashboard.py`.

### Data Ingestion Hub
- Modern ingest flow (`ingest/app/page.tsx`) with CSV schema validation, upload progress, and bank credential capture.
- Client-side header guardrails mirror backend requirements (`REQUIRED_HEADERS` shared with backend).
- Modal-driven UX for success/error states; optional redirection into the dashboard once ingestion succeeds.
- Bank connectors (HDFC/ICICI/Axis/Kotak) enforce API-key constraints before hitting the backend.

### Backend Agent Pipeline
- FastAPI routes under `Server/app/api/routes` provide:
  - `/ingest/csv` for synchronous validation + ingestion into SQLite.
  - `/ingest/live-api` for registering live connectors.
  - `/dashboard/{session_id}` for synthesized analytics views.
- `app/services/ingest.py` sanitizes CSV rows, enforces schema, and stores transactions atomically. Failures update `IngestSession` status with actionable errors.
- `app/services/agent_pipeline.py` exposes composable async functions (`record_compliance_output`, `record_fraud_output`, `record_routing_output`, `record_explainability_output`, `mark_agent_failure`, `clear_agent_failure`) with deterministic embeddings and structured logging (`agent_pipeline.log`).
- Comprehensive unit tests in `Server/tests/test_agent_pipeline.py` cover success paths, embeddings, and failure retries.

### Explainability & FAISS Integration
- Deterministic pseudo-embeddings produced via SHA256 hashes (`_generate_embedding`) keep offline environments reproducible.
- Optional FAISS persistence writes to `settings.faiss_index_path` when `faiss` and `numpy` are installed; gracefully degrades otherwise.
- Embeddings stored as byte arrays for fast retrieval and caching (`ExplainabilityCache` model).

### Client Portal
- Independent Next.js app in `apps/client-portal` tailored for customer-facing ingest mirroring.
- Opinionated Firebase deployment workflow (see `apps/client-portal/README.md`).
- Reusable layout + UI components for consistent styling across products.

## Architecture Overview

```
┌───────────────────────────── Monorepo ─────────────────────────────┐
│                                                                     │
│  Next.js Dashboard (app/, components/)                              │
│    ↔ fetches data from                                              │
│  FastAPI Backend (Server/app)                                       │
│    ↔ persists to                                                    │
│  SQLite (arealis_magnus.db)                                         │
│                                                                     │
│  Ingest Frontend (ingest/)                                          │
│    ↔ uploads CSV / connects banks → FastAPI ingest routes           │
│                                                                     │
│  Optional Client Portal (apps/client-portal/)                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

- Async SQLAlchemy session factory (`Server/app/db/session.py`) powers ingest and dashboard summaries.
- Models represent ingest sessions, transactions, bank connections, agent outputs (`Server/app/models`).
- Shared schema definitions in `Server/app/schemas` ensure consistent request/response contracts.

## Repository Layout

```
arealis-magnus-dashboard/
├─ app/                         # Main dashboard (Next.js 16 App Router)
├─ components/                  # Dashboard UI primitives & sections
├─ lib/, hooks/, styles/        # Frontend utilities
├─ ingest/                      # Data ingestion Next.js app
├─ Client/                      # Dashboard variant wired to backend API
├─ Server/                      # FastAPI backend, database, services, tests
│  ├─ app/api/routes/           # Ingest + dashboard endpoints
│  ├─ app/services/             # Ingest + agent pipeline + dashboard summaries
│  ├─ app/schemas/              # Pydantic response models
│  ├─ tests/                    # Pytest suite
│  └─ env.example               # Backend environment template
├─ apps/client-portal/          # Optional external portal
├─ synthetic_transactions.csv   # Sample dataset for testing
├─ temp_ingest_test.py          # Quick ingestion script for local API
└─ package.json, pnpm-lock.yaml, etc.
```

## Technology Stack

- **Frontend:** Next.js 16, React 19, TypeScript, TailwindCSS 4, shadcn/ui (Radix UI), Recharts, React Hook Form.
- **Backend:** FastAPI, Uvicorn, SQLAlchemy (async), SQLite + AIO driver, Pydantic Settings, optional FAISS.
- **Testing:** Pytest with `pytest-asyncio`, anyio plugin, TypeScript/ESLint linting.
- **Tooling:** pnpm/npm, PowerShell, optional Firebase CLI for the client portal.

## Getting Started

### Backend (FastAPI)

1. **Create a virtual environment**
   ```powershell
   cd Server
   py -3.11 -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
2. **Install dependencies** (adjust as needed)
   ```powershell
   pip install fastapi uvicorn[standard] sqlalchemy[asyncio] aiosqlite pydantic-settings python-dotenv pytest pytest-asyncio anyio faiss-cpu numpy
   ```
3. **Set environment variables**
   - Copy `env.example` to `.env` and update values (see [Environment Variables](#environment-variables)).
4. **Initialize the database** (optional if using defaults)
   ```powershell
   python -m app.db.init_db
   ```
5. **Run the API**
   ```powershell
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   Swagger UI will be available at `http://127.0.0.1:8000/docs`.

### Main Dashboard (Next.js)

1. **Install dependencies**
   ```powershell
   npm install          # or pnpm install
   ```
2. **Run the dev server**
   ```powershell
   npm run dev
   ```
3. **Open** `http://localhost:3000`. Append `?session=<uuid>` to load live data via the backend (`Client/app/dashboard/page.tsx` handles API binding).

### Data Ingestion Experience

1. **Install dependencies**
   ```powershell
   cd ingest
   npm install
   ```
2. **Set `NEXT_PUBLIC_API_BASE_URL`** in `ingest/.env.local` if the backend is not on the default `http://127.0.0.1:8000/api/v1`.
3. **Run**
   ```powershell
   npm run dev
   ```
4. Visit `http://localhost:3002` (or whichever port Next picks). Successful CSV uploads redirect back to the dashboard with the generated session id.

### Client Portal

1. **Install dependencies**
   ```powershell
   cd apps/client-portal
   npm install
   ```
2. Follow the instructions in `apps/client-portal/README.md` for local dev (`npm run dev`) and Firebase deployment automation.

## Environment Variables

### Backend (`Server/.env`)
| Key                         | Description                                                        | Default                                       |
|-----------------------------|--------------------------------------------------------------------|-----------------------------------------------|
| `DATABASE_URL`              | SQLAlchemy DSN (`sqlite+aiosqlite:///./arealis_magnus.db`)         | Uses local SQLite file                        |
| `CORS_ORIGINS`              | Allowed origins for frontend apps                                 | Localhost variants 3000-3002                  |
| `FAISS_INDEX_PATH`          | Path to FAISS index file                                           | `/data/faiss/explainability.index`           |
| `EXPLAINABILITY_EMBEDDING_DIM` | Embedding dimensionality (must match FAISS index)             | `32`                                          |

### Frontend (`.env.local` in each Next.js app)
| Key                         | Description                                                        | Default                                       |
|-----------------------------|--------------------------------------------------------------------|-----------------------------------------------|
| `NEXT_PUBLIC_API_BASE_URL`  | Base URL for the FastAPI gateway (no trailing slash)               | `http://127.0.0.1:8000/api/v1`                |

## Running the Test Suite

1. Ensure the backend virtual environment is active.
2. Install testing dependencies (`pytest`, `pytest-asyncio`).
3. Run:
   ```powershell
   cd Server
   pytest
   ```
   The suite exercises the agent pipeline, ensuring async fixtures are handled correctly. If you see `async def functions are not natively supported`, install `pytest-asyncio` and declare `pytest_plugins = ("pytest_asyncio",)` in `Server/tests/conftest.py`.

## Sample Data & Utilities

- `synthetic_transactions.csv`: provides a representative dataset for ingest testing.
- `temp_ingest_test.py`: POSTs the CSV to the running backend (`/api/v1/ingest/csv`) and prints the response.
- `agent_pipeline.log`: structured logs produced whenever pipeline functions run; useful for debugging agent outputs.

## Deployment Guide

### Frontend → Vercel
- Connect GitHub repo and select the desired Next.js app directory (e.g., root for dashboard, `ingest` for ingestion flow).
- Build command: `npm install && npm run build`.
- Output directory: `.next`.
- Configure environment variables (notably `NEXT_PUBLIC_API_BASE_URL`) before deploying.
- Redeploy whenever backend endpoints move (e.g., Render URL change).

### Backend → Render (or similar PaaS)
- Create a web service pointing to `Server/`.
- Build command: `pip install -r requirements.txt` (provide a requirements file with FastAPI, SQLAlchemy, etc.).
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port ${PORT}`.
- Set environment variables from `env.example`.
- Attach persistent disk if using SQLite in production (`DATABASE_URL=sqlite+aiosqlite:///var/data/arealis_magnus.db`).
- Consider switching to Postgres for multi-instance setups.

### Client Portal → Firebase (optional)
- Install Firebase CLI.
- Auth with `firebase login`.
- Deploy using the workflow documented in `apps/client-portal/README.md`.

## Troubleshooting

- **`ModuleNotFoundError: No module named 'app'` in tests**  
  Ensure `Server/tests/conftest.py` inserts the project root into `sys.path`, or run tests with `PYTHONPATH=.`.
- **`async def functions are not natively supported`**  
  Install `pytest-asyncio` and register the plugin.
- **`git push` rejected (non-fast-forward)**  
  Pull/rebase `origin/master` before pushing (`git pull --rebase origin master`).
- **FAISS errors**  
  If FAISS is unavailable, set `FAISS_INDEX_PATH` to a temp location or uninstall `faiss`; the code will skip vector indexing.

## Contributing

1. Create a feature branch from `master`.
2. Keep backend tests (`pytest`) and frontend lint/tasks (`npm run lint`, `npm run build`) passing.
3. Submit a pull request detailing:
   - Feature or fix summary.
   - Testing performed.
   - Screenshots or sample payloads when relevant.
4. Follow conventional commits if possible (`feat:`, `fix:`).

Happy building!

