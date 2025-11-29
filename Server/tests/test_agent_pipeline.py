from __future__ import annotations

import json
import uuid

import pytest
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.db.session import Base
from app.models import AgentFailure, AgentStatus, IngestSession, IngestSource, IngestStatus
from app.services.agent_pipeline import (
  clear_agent_failure,
  mark_agent_failure,
  record_compliance_output,
  record_explainability_output,
  record_fraud_output,
  record_routing_output,
)


@pytest.fixture
async def db_session(tmp_path) -> AsyncSession:
  engine = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    echo=False,
    future=True,
  )
  async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)

  original_index_path = settings.faiss_index_path
  settings.faiss_index_path = str(tmp_path / "faiss" / "test.index")

  session_factory = async_sessionmaker(engine, expire_on_commit=False)
  async with session_factory() as session:
    yield session

  settings.faiss_index_path = original_index_path
  await engine.dispose()


@pytest.mark.asyncio
async def test_agent_pipeline_happy_path(db_session: AsyncSession) -> None:
  ingest_session = IngestSession(
    id=uuid.uuid4(),
    source=IngestSource.CSV,
    status=IngestStatus.PROCESSING,
    records_ingested=5,
  )
  async with db_session.begin():
    db_session.add(ingest_session)

  compliance = await record_compliance_output(
    db_session,
    trace_id="trace-123",
    session_id=ingest_session.id,
    raw_input={"amount": 1000},
    compliance_summary={"status": "green"},
    risk_score=0.2,
    status=AgentStatus.COMPLETE,
    next_agent="fraud_detection",
    latency_ms=120.5,
  )

  assert compliance.id is not None
  assert compliance.next_agent == "fraud_detection"
  assert compliance.status is AgentStatus.COMPLETE

  fraud = await record_fraud_output(
    db_session,
    trace_id="trace-123",
    probability_score=0.45,
    flagged_features={"high_amount": True},
    explanatory_notes="Manual review suggested.",
    status=AgentStatus.COMPLETE,
    next_agent="routing",
    latency_ms=98.2,
  )

  assert pytest.approx(fraud.probability_score, rel=1e-4) == 0.45
  assert fraud.flagged_features == {"high_amount": True}

  routing = await record_routing_output(
    db_session,
    trace_id="trace-123",
    recommended_route={"bank": "HDFC"},
    alternatives={"fallback": "ICICI"},
    confidence=0.88,
    status=AgentStatus.COMPLETE,
    next_agent="explainability",
    latency_ms=64.1,
  )

  assert routing.recommended_route["bank"] == "HDFC"
  assert routing.confidence == pytest.approx(0.88, rel=1e-4)

  explainability = await record_explainability_output(
    db_session,
    trace_id="trace-123",
    explanation="Chosen due to fee optimization.",
    supporting_evidence={"feature": "fee"},
    status=AgentStatus.COMPLETE,
    next_agent="none",
    latency_ms=35.0,
  )

  assert explainability.explanation.startswith("Chosen")
  assert explainability.embedding is not None
  assert len(explainability.embedding) > 0

  updated = await record_explainability_output(
    db_session,
    trace_id="trace-123",
    explanation="Updated rationale with new data.",
    supporting_evidence={"feature": "risk"},
    status=AgentStatus.COMPLETE,
    next_agent="none",
    latency_ms=40.0,
  )

  assert updated.explanation.startswith("Updated")
  assert updated.embedding is not None
  assert updated.embedding != explainability.embedding


@pytest.mark.asyncio
async def test_agent_failure_tracking(db_session: AsyncSession) -> None:
  failure = await mark_agent_failure(
    db_session,
    agent_name="fraud_detection",
    trace_id="failure-001",
    error_payload={"error": "timeout"},
    latency_ms=501.2,
  )

  assert failure.retry_count == 1
  assert json.loads(json.dumps(failure.error_payload)) == {"error": "timeout"}

  second = await mark_agent_failure(
    db_session,
    agent_name="fraud_detection",
    trace_id="failure-001",
    error_payload={"error": "timeout"},
    latency_ms=600.0,
  )

  assert second.retry_count == 2

  await clear_agent_failure(
    db_session,
    agent_name="fraud_detection",
    trace_id="failure-001",
  )

  # Clearing should remove the failure entry entirely.
  result = await db_session.execute(
    select(func.count())
    .select_from(AgentFailure)
    .where(
      AgentFailure.agent_name == "fraud_detection",
      AgentFailure.trace_id == "failure-001",
    )
  )
  count = result.scalar_one()

  assert count == 0

