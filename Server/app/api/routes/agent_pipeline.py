from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas import (
  AgentFailureClearRequest,
  AgentFailureRequest,
  AgentFailureResponse,
  ComplianceOutputRequest,
  ComplianceOutputResponse,
  ExplainabilityOutputRequest,
  ExplainabilityOutputResponse,
  FraudOutputRequest,
  FraudOutputResponse,
  RoutingOutputRequest,
  RoutingOutputResponse,
)
from app.services.agent_pipeline import (
  clear_agent_failure,
  mark_agent_failure,
  record_compliance_output,
  record_explainability_output,
  record_fraud_output,
  record_routing_output,
)

router = APIRouter(prefix="/agents", tags=["agents"])


def _ts(value: datetime) -> str:
  if value.tzinfo is None:
    value = value.replace(tzinfo=timezone.utc)
  return value.astimezone(timezone.utc).isoformat()


@router.post("/compliance", response_model=ComplianceOutputResponse, status_code=status.HTTP_201_CREATED)
async def upsert_compliance_output(
  payload: ComplianceOutputRequest,
  db: AsyncSession = Depends(get_session),
) -> ComplianceOutputResponse:
  record = await record_compliance_output(
    db,
    trace_id=payload.trace_id,
    session_id=payload.session_id,
    raw_input=payload.raw_input,
    compliance_summary=payload.compliance_summary,
    risk_score=payload.risk_score,
    status=payload.status,
    next_agent=payload.next_agent,
    latency_ms=payload.latency_ms,
  )
  return ComplianceOutputResponse(
    id=record.id,
    trace_id=record.trace_id,
    session_id=record.session_id,
    status=record.status,
    next_agent=record.next_agent,
    created_at=_ts(record.created_at),
    updated_at=_ts(record.updated_at),
    risk_score=record.risk_score,
    compliance_summary=record.compliance_summary,
  )


@router.post("/fraud", response_model=FraudOutputResponse, status_code=status.HTTP_201_CREATED)
async def upsert_fraud_output(
  payload: FraudOutputRequest,
  db: AsyncSession = Depends(get_session),
) -> FraudOutputResponse:
  try:
    record = await record_fraud_output(
      db,
      trace_id=payload.trace_id,
      probability_score=payload.probability_score,
      flagged_features=payload.flagged_features,
      explanatory_notes=payload.explanatory_notes,
      status=payload.status,
      next_agent=payload.next_agent,
      latency_ms=payload.latency_ms,
    )
  except ValueError as exc:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

  return FraudOutputResponse(
    id=record.id,
    trace_id=record.trace_id,
    status=record.status,
    next_agent=record.next_agent,
    created_at=_ts(record.created_at),
    updated_at=_ts(record.updated_at),
    probability_score=record.probability_score,
    flagged_features=record.flagged_features,
    explanatory_notes=record.explanatory_notes,
  )


@router.post("/routing", response_model=RoutingOutputResponse, status_code=status.HTTP_201_CREATED)
async def upsert_routing_output(
  payload: RoutingOutputRequest,
  db: AsyncSession = Depends(get_session),
) -> RoutingOutputResponse:
  try:
    record = await record_routing_output(
      db,
      trace_id=payload.trace_id,
      recommended_route=payload.recommended_route,
      alternatives=payload.alternatives,
      confidence=payload.confidence,
      status=payload.status,
      next_agent=payload.next_agent,
      latency_ms=payload.latency_ms,
    )
  except ValueError as exc:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

  return RoutingOutputResponse(
    id=record.id,
    trace_id=record.trace_id,
    status=record.status,
    next_agent=record.next_agent,
    created_at=_ts(record.created_at),
    updated_at=_ts(record.updated_at),
    recommended_route=record.recommended_route,
    alternatives=record.alternatives,
    confidence=record.confidence,
  )


@router.post("/explainability", response_model=ExplainabilityOutputResponse, status_code=status.HTTP_201_CREATED)
async def upsert_explainability_output(
  payload: ExplainabilityOutputRequest,
  db: AsyncSession = Depends(get_session),
) -> ExplainabilityOutputResponse:
  try:
    record = await record_explainability_output(
      db,
      trace_id=payload.trace_id,
      explanation=payload.explanation,
      supporting_evidence=payload.supporting_evidence,
      status=payload.status,
      next_agent=payload.next_agent,
      latency_ms=payload.latency_ms,
    )
  except ValueError as exc:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

  return ExplainabilityOutputResponse(
    id=record.id,
    trace_id=record.trace_id,
    status=record.status,
    next_agent=record.next_agent,
    created_at=_ts(record.created_at),
    updated_at=_ts(record.updated_at),
    explanation=record.explanation,
    supporting_evidence=record.supporting_evidence,
  )


@router.post("/failures", response_model=AgentFailureResponse, status_code=status.HTTP_201_CREATED)
async def report_agent_failure(
  payload: AgentFailureRequest,
  db: AsyncSession = Depends(get_session),
) -> AgentFailureResponse:
  record = await mark_agent_failure(
    db,
    agent_name=payload.agent_name,
    trace_id=payload.trace_id,
    error_payload=payload.error_payload,
    latency_ms=payload.latency_ms,
  )
  return AgentFailureResponse(
    id=record.id,
    agent_name=record.agent_name,
    trace_id=record.trace_id,
    retry_count=record.retry_count,
    error_payload=record.error_payload,
    created_at=_ts(record.created_at),
    updated_at=_ts(record.updated_at),
  )


@router.post("/failures/clear", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
async def clear_agent_failure_record(
  payload: AgentFailureClearRequest,
  db: AsyncSession = Depends(get_session),
) -> Response:
  await clear_agent_failure(
    db,
    agent_name=payload.agent_name,
    trace_id=payload.trace_id,
  )
  return Response(status_code=status.HTTP_204_NO_CONTENT)

