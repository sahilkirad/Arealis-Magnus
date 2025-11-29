from __future__ import annotations

import enum
from datetime import datetime
from typing import ClassVar

from sqlalchemy import DateTime, Enum as SAEnum, String, func
from sqlalchemy.orm import Mapped, declared_attr, mapped_column


class AgentStatus(str, enum.Enum):
  PENDING = "pending"
  COMPLETE = "complete"
  ERROR = "error"


class TimestampMixin:
  @declared_attr
  def created_at(cls) -> Mapped[datetime]:
    return mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

  @declared_attr
  def updated_at(cls) -> Mapped[datetime]:
    return mapped_column(
      DateTime(timezone=True),
      server_default=func.now(),
      onupdate=func.now(),
      nullable=False,
    )


class AgentLifecycleMixin(TimestampMixin):
  __next_agent_default__: ClassVar[str] = "none"

  @declared_attr
  def status(cls) -> Mapped[AgentStatus]:
    return mapped_column(
      SAEnum(AgentStatus, name="agent_status"),
      nullable=False,
      default=AgentStatus.COMPLETE,
    )

  @declared_attr
  def next_agent(cls) -> Mapped[str]:
    default_value = getattr(cls, "__next_agent_default__", "none")
    return mapped_column(String(64), nullable=False, default=default_value)

