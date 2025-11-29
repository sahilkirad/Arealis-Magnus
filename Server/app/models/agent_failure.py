from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Integer, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base
from app.models.agent_common import TimestampMixin


class AgentFailure(TimestampMixin, Base):
  __tablename__ = "agent_failures"

  id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
  agent_name: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
  trace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
  error_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
  retry_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
  last_attempt_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now(),
    onupdate=func.now(),
    nullable=False,
  )
  def __repr__(self) -> str:
    return f"<AgentFailure agent={self.agent_name} trace_id={self.trace_id} retries={self.retry_count}>"

