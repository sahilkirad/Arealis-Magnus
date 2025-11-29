from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.agent_common import AgentLifecycleMixin

if TYPE_CHECKING:
  from app.models.compliance_check import ComplianceCheck
  from app.models.route_selection import RouteSelection


class FraudFlag(AgentLifecycleMixin, Base):
  __tablename__ = "fraud_flags"

  __next_agent_default__ = "routing"

  id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
  trace_id: Mapped[str] = mapped_column(
    String(64),
    ForeignKey("compliance_checks.trace_id", ondelete="CASCADE"),
    unique=True,
    nullable=False,
    index=True,
  )
  probability_score: Mapped[float] = mapped_column(Float, nullable=False)
  flagged_features: Mapped[dict | None] = mapped_column(JSON, nullable=True)
  explanatory_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

  compliance_check: Mapped["ComplianceCheck"] = relationship(back_populates="fraud_flag", lazy="joined")
  route_selection: Mapped["RouteSelection | None"] = relationship(
    back_populates="fraud_flag",
    uselist=False,
    passive_deletes=True,
  )

  __table_args__ = (
    CheckConstraint(
      "probability_score >= 0.0 AND probability_score <= 1.0",
      name="ck_fraud_probability_range",
    ),
  )

  def __repr__(self) -> str:
    return f"<FraudFlag trace_id={self.trace_id} status={self.status}>"

