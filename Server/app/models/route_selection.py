from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.agent_common import AgentLifecycleMixin

if TYPE_CHECKING:
  from app.models.fraud_flag import FraudFlag
  from app.models.explainability_cache import ExplainabilityCache


class RouteSelection(AgentLifecycleMixin, Base):
  __tablename__ = "route_selection"

  __next_agent_default__ = "explainability"

  id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
  trace_id: Mapped[str] = mapped_column(
    String(64),
    ForeignKey("fraud_flags.trace_id", ondelete="CASCADE"),
    unique=True,
    nullable=False,
    index=True,
  )
  recommended_route: Mapped[dict | None] = mapped_column(JSON, nullable=True)
  alternatives: Mapped[dict | None] = mapped_column(JSON, nullable=True)
  confidence: Mapped[float] = mapped_column(Float, nullable=False)

  fraud_flag: Mapped["FraudFlag"] = relationship(back_populates="route_selection", lazy="joined")
  explainability_cache: Mapped["ExplainabilityCache | None"] = relationship(
    back_populates="route_selection",
    uselist=False,
    passive_deletes=True,
  )

  __table_args__ = (
    CheckConstraint(
      "confidence >= 0.0 AND confidence <= 1.0",
      name="ck_route_confidence_range",
    ),
  )

  def __repr__(self) -> str:
    return f"<RouteSelection trace_id={self.trace_id} status={self.status}>"

