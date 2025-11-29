# Arealis Magnus Server

This service exposes the ingest + dashboard API and now runs entirely on SQLite by default.

## Database & Migrations

- The async SQLAlchemy engine reads `DATABASE_URL` (see `app/core/config.py`), which defaults to `sqlite+aiosqlite:///./arealis_magnus.db`.
- To initialise the schema locally run:
  - `python -m app.db.init_db` (from the `Server` directory), or
  - `python app/db/init_db.py`
- Foreign-key enforcement is enabled for SQLite during connection setup, so cascading deletes (e.g. removing an ingest session) will also clean up related agent output rows.

## Agent Processing Pipeline

After every CSV ingest the pipeline executes in order:

1. **Compliance Agent** → stores results in `compliance_checks` and triggers the next stage.
2. **Fraud Agent** → persists to `fraud_flags`.
3. **Routing Agent** → writes to `route_selection`.
4. **Explainability Agent** → caches insights in `explainability_cache` and pushes embeddings to FAISS when available.

These tables back the dashboard API so repeated reads do not recompute the agents. Hard-coded visual layers (settlement, reconciliation, multibank, audit) continue to be generated on demand.

## Explainability Embeddings

- Embeddings are deterministically generated for each explainability insight and stored in SQLite.
- If the `faiss` Python package is installed, the vectors are also indexed in a FAISS file at `FAISS_INDEX_PATH` (defaults to `/data/faiss/explainability.index`). Missing FAISS simply skips that step.
- Tune embedding size with `EXPLAINABILITY_EMBEDDING_DIM` in the environment as needed.

## Environment Variables

See `env.example` for a full list (`DATABASE_URL`, `CORS_ORIGINS`, `FAISS_INDEX_PATH`, `EXPLAINABILITY_EMBEDDING_DIM`).

