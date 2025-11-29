from __future__ import annotations

import uuid
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field, field_validator

from app.models.agent_common import AgentStatus


class AgentBaseResponse(BaseModel):
  id: int
  trace_id: str
  status: AgentStatus
  next_agent: str
  created_at: str
  updated_at: str

  model_config = {"use_enum_values": True}


class ComplianceOutputRequest(BaseModel):
  trace_id: str = Field(..., description="Pipeline trace identifier shared across agents.")
  session_id: uuid.UUID
  raw_input: Optional[Dict[str, Any]] = None
  compliance_summary: Optional[Dict[str, Any]] = None
  risk_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
  status: Optional[AgentStatus] = Field(default=None)
  next_agent: Optional[str] = Field(default=None, description="Override for next agent hint.")
  latency_ms: Optional[float] = Field(default=None, ge=0.0)

  model_config = {"use_enum_values": True}


class ComplianceOutputResponse(AgentBaseResponse):
  session_id: uuid.UUID
  risk_score: Optional[float] = None
  compliance_summary: Optional[Dict[str, Any]] = None


class FraudOutputRequest(BaseModel):
  trace_id: str
  probability_score: float = Field(..., ge=0.0, le=1.0)
  flagged_features: Optional[Dict[str, Any]] = None
  explanatory_notes: Optional[str] = None
  status: Optional[AgentStatus] = None
  next_agent: Optional[str] = None
  latency_ms: Optional[float] = Field(default=None, ge=0.0)

  model_config = {"use_enum_values": True}


class FraudOutputResponse(AgentBaseResponse):
  probability_score: float
  flagged_features: Optional[Dict[str, Any]] = None
  explanatory_notes: Optional[str] = None


class RoutingOutputRequest(BaseModel):
  trace_id: str
  recommended_route: Optional[Dict[str, Any]] = None
  alternatives: Optional[Dict[str, Any]] = None
  confidence: float = Field(..., ge=0.0, le=1.0)
  status: Optional[AgentStatus] = None
  next_agent: Optional[str] = None
  latency_ms: Optional[float] = Field(default=None, ge=0.0)

  model_config = {"use_enum_values": True}


class RoutingOutputResponse(AgentBaseResponse):
  recommended_route: Optional[Dict[str, Any]] = None
  alternatives: Optional[Dict[str, Any]] = None
  confidence: float


class ExplainabilityOutputRequest(BaseModel):
  trace_id: str
  explanation: str = Field(..., min_length=1)
  supporting_evidence: Optional[Dict[str, Any]] = None
  status: Optional[AgentStatus] = None
  next_agent: Optional[str] = None
  latency_ms: Optional[float] = Field(default=None, ge=0.0)

  model_config = {"use_enum_values": True}


class ExplainabilityOutputResponse(AgentBaseResponse):
  explanation: str
  supporting_evidence: Optional[Dict[str, Any]] = None


class AgentFailureRequest(BaseModel):
  agent_name: str = Field(..., min_length=1)
  trace_id: str = Field(..., min_length=1)
  error_payload: Optional[Dict[str, Any]] = None
  latency_ms: Optional[float] = Field(default=None, ge=0.0)


class AgentFailureResponse(BaseModel):
  id: int
  agent_name: str
  trace_id: str
  retry_count: int
  error_payload: Optional[Dict[str, Any]] = None
  created_at: str
  updated_at: str


class AgentFailureClearRequest(BaseModel):
  agent_name: str
  trace_id: str

  @field_validator("agent_name", "trace_id")
  @classmethod
  def not_blank(cls, value: str) -> str:
    if not value or not value.strip():
      raise ValueError("Value cannot be blank.")
    return value.strip()

