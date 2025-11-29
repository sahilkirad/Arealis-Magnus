from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, JSON, LargeBinary, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.agent_common import AgentLifecycleMixin

if TYPE_CHECKING:
  from app.models.route_selection import RouteSelection


class ExplainabilityCache(AgentLifecycleMixin, Base):
  __tablename__ = "explainability_cache"

  __next_agent_default__ = "none"

  id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
  trace_id: Mapped[str] = mapped_column(
    String(64),
    ForeignKey("route_selection.trace_id", ondelete="CASCADE"),
    unique=True,
    nullable=False,
    index=True,
  )
  explanation: Mapped[str] = mapped_column(Text, nullable=False)
  supporting_evidence: Mapped[dict | None] = mapped_column(JSON, nullable=True)
  embedding: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)

  route_selection: Mapped["RouteSelection"] = relationship(back_populates="explainability_cache", lazy="joined")

  def __repr__(self) -> str:
    return f"<ExplainabilityCache trace_id={self.trace_id} status={self.status}>"

