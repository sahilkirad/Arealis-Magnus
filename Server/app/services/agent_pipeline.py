from __future__ import annotations

import json
import logging
import math
import uuid
from array import array
from datetime import datetime
from hashlib import blake2s, sha256
from pathlib import Path
from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models import (
  AgentFailure,
  AgentStatus,
  ComplianceCheck,
  ExplainabilityCache,
  FraudFlag,
  RouteSelection,
)

try:  # pragma: no cover - optional dependency
  import faiss  # type: ignore
  import numpy as np  # type: ignore
except ImportError:  # pragma: no cover - skip FAISS integration when unavailable
  faiss = None  # type: ignore
  np = None  # type: ignore


__all__ = [
  "record_compliance_output",
  "record_fraud_output",
  "record_routing_output",
  "record_explainability_output",
  "mark_agent_failure",
  "clear_agent_failure",
]


_PIPELINE_LOGGER = logging.getLogger("agent_pipeline")
if not _PIPELINE_LOGGER.handlers:
  handler = logging.FileHandler("agent_pipeline.log")
  handler.setFormatter(logging.Formatter("%(message)s"))
  _PIPELINE_LOGGER.addHandler(handler)
  _PIPELINE_LOGGER.setLevel(logging.INFO)
  _PIPELINE_LOGGER.propagate = False


def _coerce_status(status: AgentStatus | str | None) -> AgentStatus:
  if status is None:
    return AgentStatus.COMPLETE
  if isinstance(status, AgentStatus):
    return status
  try:
    return AgentStatus(status)
  except ValueError as exc:
    raise ValueError(f"Invalid agent status '{status}'.") from exc


def _ensure_unit_interval(value: float | None, field_name: str) -> float | None:
  if value is None:
    return None
  if math.isnan(value) or value < 0.0 or value > 1.0:
    raise ValueError(f"{field_name} must be within [0.0, 1.0].")
  return float(value)


def _structured_log(agent: str, trace_id: str, status: AgentStatus, latency_ms: float | None, extra: dict[str, Any]) -> None:
  payload = {
    "timestamp": datetime.utcnow().isoformat(),
    "agent": agent,
    "trace_id": trace_id,
    "status": status.value,
  }
  if latency_ms is not None:
    payload["latency_ms"] = round(latency_ms, 2)
  payload.update(extra)
  _PIPELINE_LOGGER.info(json.dumps(payload, ensure_ascii=False))


def _trace_id_to_long(trace_id: str) -> int:
  digest = blake2s(trace_id.encode("utf-8"), digest_size=8).digest()
  return int.from_bytes(digest, "big", signed=False)


def _generate_embedding(text: str, dim: int) -> list[float]:
  # Deterministic pseudo-embedding for offline environments.
  if dim <= 0:
    raise ValueError("Embedding dimension must be positive.")
  seed = text.encode("utf-8") or b"\x00"
  vector: list[float] = []
  counter = 0
  while len(vector) < dim:
    digest = sha256(seed + counter.to_bytes(4, "little")).digest()
    counter += 1
    for offset in range(0, len(digest), 4):
      if len(vector) >= dim:
        break
      chunk = digest[offset : offset + 4]
      value = int.from_bytes(chunk, "little", signed=False) / 0xFFFFFFFF
      vector.append(value)
  norm = math.sqrt(sum(val * val for val in vector))
  if norm == 0.0:
    return [0.0] * dim
  return [val / norm for val in vector]


def _embedding_to_bytes(vector: list[float]) -> bytes:
  return array("f", vector).tobytes()


def _persist_embedding_faiss(trace_id: str, vector: list[float]) -> None:
  if faiss is None or np is None:
    return

  index_path = Path(settings.faiss_index_path)
  index_path.parent.mkdir(parents=True, exist_ok=True)

  try:
    dim = len(vector)
    if index_path.exists():
      index = faiss.read_index(str(index_path))
      if index.d != dim:
        # Dimension mismatch, rebuild index afresh.
        index = faiss.IndexIDMap(faiss.IndexFlatIP(dim))
    else:
      index = faiss.IndexIDMap(faiss.IndexFlatIP(dim))

    if not isinstance(index, faiss.IndexIDMap):
      index = faiss.IndexIDMap(index)

    vector_id = _trace_id_to_long(trace_id)
    id_array = np.array([vector_id], dtype="int64")
    vector_array = np.array([vector], dtype="float32")

    index.remove_ids(id_array)
    index.add_with_ids(vector_array, id_array)
    faiss.write_index(index, str(index_path))
  except Exception as exc:  # pragma: no cover - defensive logging
    warning_payload = {
      "timestamp": datetime.utcnow().isoformat(),
      "agent": "explainability",
      "trace_id": trace_id,
      "status": "warning",
      "message": f"Failed to persist FAISS embedding: {exc}",
    }
    _PIPELINE_LOGGER.warning(json.dumps(warning_payload, ensure_ascii=False))


async def _clear_agent_failure_in_tx(db: AsyncSession, agent_name: str, trace_id: str) -> None:
  await db.execute(
    delete(AgentFailure).where(
      AgentFailure.agent_name == agent_name,
      AgentFailure.trace_id == trace_id,
    )
  )


async def record_compliance_output(
  db: AsyncSession,
  *,
  trace_id: str,
  session_id: uuid.UUID,
  raw_input: dict[str, Any] | None,
  compliance_summary: dict[str, Any] | None,
  risk_score: float | None,
  status: AgentStatus | str | None = None,
  next_agent: str | None = None,
  latency_ms: float | None = None,
) -> ComplianceCheck:
  status_value = _coerce_status(status)
  risk = _ensure_unit_interval(risk_score, "risk_score")

  async with db.begin():
    record = await db.scalar(select(ComplianceCheck).where(ComplianceCheck.trace_id == trace_id))
    if record is None:
      record = ComplianceCheck(
        trace_id=trace_id,
        session_id=session_id,
        raw_input=raw_input,
        compliance_summary=compliance_summary,
        risk_score=risk,
        status=status_value,
      )
      if next_agent:
        record.next_agent = next_agent
      db.add(record)
    else:
      record.session_id = session_id
      record.raw_input = raw_input
      record.compliance_summary = compliance_summary
      record.risk_score = risk
      record.status = status_value
      if next_agent:
        record.next_agent = next_agent

    await _clear_agent_failure_in_tx(db, "compliance", trace_id)
    await db.flush()

  _structured_log(
    "compliance",
    trace_id,
    status_value,
    latency_ms,
    {"record_id": record.id, "next_agent": record.next_agent, "risk_score": risk},
  )
  return record


async def record_fraud_output(
  db: AsyncSession,
  *,
  trace_id: str,
  probability_score: float,
  flagged_features: dict[str, Any] | None,
  explanatory_notes: str | None,
  status: AgentStatus | str | None = None,
  next_agent: str | None = None,
  latency_ms: float | None = None,
) -> FraudFlag:
  status_value = _coerce_status(status)
  probability = _ensure_unit_interval(probability_score, "probability_score")

  async with db.begin():
    record = await db.scalar(select(FraudFlag).where(FraudFlag.trace_id == trace_id))
    if record is None:
      parent = await db.scalar(select(ComplianceCheck.trace_id).where(ComplianceCheck.trace_id == trace_id))
      if parent is None:
        raise ValueError(f"Cannot record fraud output without compliance record for trace_id={trace_id}.")

      record = FraudFlag(
        trace_id=trace_id,
        probability_score=probability,
        flagged_features=flagged_features,
        explanatory_notes=explanatory_notes,
        status=status_value,
      )
      if next_agent:
        record.next_agent = next_agent
      db.add(record)
    else:
      record.probability_score = probability
      record.flagged_features = flagged_features
      record.explanatory_notes = explanatory_notes
      record.status = status_value
      if next_agent:
        record.next_agent = next_agent

    await _clear_agent_failure_in_tx(db, "fraud_detection", trace_id)
    await db.flush()

  _structured_log(
    "fraud_detection",
    trace_id,
    status_value,
    latency_ms,
    {"record_id": record.id, "next_agent": record.next_agent, "probability_score": probability},
  )
  return record


async def record_routing_output(
  db: AsyncSession,
  *,
  trace_id: str,
  recommended_route: dict[str, Any] | None,
  alternatives: dict[str, Any] | None,
  confidence: float,
  status: AgentStatus | str | None = None,
  next_agent: str | None = None,
  latency_ms: float | None = None,
) -> RouteSelection:
  status_value = _coerce_status(status)
  confidence_value = _ensure_unit_interval(confidence, "confidence")

  async with db.begin():
    record = await db.scalar(select(RouteSelection).where(RouteSelection.trace_id == trace_id))
    if record is None:
      parent = await db.scalar(select(FraudFlag.trace_id).where(FraudFlag.trace_id == trace_id))
      if parent is None:
        raise ValueError(f"Cannot record routing output without fraud record for trace_id={trace_id}.")

      record = RouteSelection(
        trace_id=trace_id,
        recommended_route=recommended_route,
        alternatives=alternatives,
        confidence=confidence_value,
        status=status_value,
      )
      if next_agent:
        record.next_agent = next_agent
      db.add(record)
    else:
      record.recommended_route = recommended_route
      record.alternatives = alternatives
      record.confidence = confidence_value
      record.status = status_value
      if next_agent:
        record.next_agent = next_agent

    await _clear_agent_failure_in_tx(db, "routing", trace_id)
    await db.flush()

  _structured_log(
    "routing",
    trace_id,
    status_value,
    latency_ms,
    {"record_id": record.id, "next_agent": record.next_agent, "confidence": confidence_value},
  )
  return record


async def record_explainability_output(
  db: AsyncSession,
  *,
  trace_id: str,
  explanation: str,
  supporting_evidence: dict[str, Any] | None,
  status: AgentStatus | str | None = None,
  next_agent: str | None = None,
  latency_ms: float | None = None,
) -> ExplainabilityCache:
  status_value = _coerce_status(status)
  embedding_vector: list[float] | None = None

  async with db.begin():
    record = await db.scalar(select(ExplainabilityCache).where(ExplainabilityCache.trace_id == trace_id))
    if record is None:
      parent = await db.scalar(select(RouteSelection.trace_id).where(RouteSelection.trace_id == trace_id))
      if parent is None:
        raise ValueError(f"Cannot record explainability output without routing record for trace_id={trace_id}.")

      embedding_vector = _generate_embedding(explanation, settings.explainability_embedding_dim)
      record = ExplainabilityCache(
        trace_id=trace_id,
        explanation=explanation,
        supporting_evidence=supporting_evidence,
        embedding=_embedding_to_bytes(embedding_vector),
        status=status_value,
      )
      if next_agent:
        record.next_agent = next_agent
      db.add(record)
    else:
      explanation_changed = record.explanation != explanation
      record.explanation = explanation
      record.supporting_evidence = supporting_evidence
      record.status = status_value
      if next_agent:
        record.next_agent = next_agent

      if explanation_changed:
        embedding_vector = _generate_embedding(explanation, settings.explainability_embedding_dim)
        record.embedding = _embedding_to_bytes(embedding_vector)

    await _clear_agent_failure_in_tx(db, "explainability", trace_id)
    await db.flush()

  if embedding_vector is not None:
    _persist_embedding_faiss(trace_id, embedding_vector)

  _structured_log(
    "explainability",
    trace_id,
    status_value,
    latency_ms,
    {"record_id": record.id, "next_agent": record.next_agent},
  )
  return record


async def mark_agent_failure(
  db: AsyncSession,
  *,
  agent_name: str,
  trace_id: str,
  error_payload: dict[str, Any] | None,
  latency_ms: float | None = None,
) -> AgentFailure:
  async with db.begin():
    record = await db.scalar(
      select(AgentFailure).where(
        AgentFailure.agent_name == agent_name,
        AgentFailure.trace_id == trace_id,
      )
    )
    if record is None:
      record = AgentFailure(
        agent_name=agent_name,
        trace_id=trace_id,
        error_payload=error_payload,
        retry_count=1,
      )
      db.add(record)
    else:
      record.retry_count += 1
      record.error_payload = error_payload

    await db.flush()

  _structured_log(
    "agent_failure",
    trace_id,
    AgentStatus.ERROR,
    latency_ms,
    {"agent": agent_name, "retry_count": record.retry_count},
  )
  return record


async def clear_agent_failure(
  db: AsyncSession,
  *,
  agent_name: str,
  trace_id: str,
) -> None:
  async with db.begin():
    await _clear_agent_failure_in_tx(db, agent_name, trace_id)
    await db.flush()

