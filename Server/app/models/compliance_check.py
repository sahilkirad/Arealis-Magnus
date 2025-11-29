from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Float, ForeignKey, Integer, JSON, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.agent_common import AgentLifecycleMixin

if TYPE_CHECKING:
  from app.models.ingest_session import IngestSession
  from app.models.fraud_flag import FraudFlag


class ComplianceCheck(AgentLifecycleMixin, Base):
  __tablename__ = "compliance_checks"

  __next_agent_default__ = "fraud_detection"

  id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
  trace_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
  session_id: Mapped[uuid.UUID] = mapped_column(
    Uuid(as_uuid=True),
    ForeignKey("ingest_sessions.id", ondelete="CASCADE"),
    nullable=False,
    index=True,
  )
  raw_input: Mapped[dict | None] = mapped_column(JSON, nullable=True)
  compliance_summary: Mapped[dict | None] = mapped_column(JSON, nullable=True)
  risk_score: Mapped[float | None] = mapped_column(Float, nullable=True)

  ingest_session: Mapped["IngestSession"] = relationship(back_populates="compliance_checks")
  fraud_flag: Mapped["FraudFlag | None"] = relationship(
    back_populates="compliance_check",
    uselist=False,
    passive_deletes=True,
  )

  __table_args__ = (
    CheckConstraint(
      "risk_score IS NULL OR (risk_score >= 0.0 AND risk_score <= 1.0)",
      name="ck_compliance_risk_range",
    ),
  )

  def __repr__(self) -> str:
    return f"<ComplianceCheck trace_id={self.trace_id} status={self.status}>"

