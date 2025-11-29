from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, JSON, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.ingest_session import IngestSession


class BankConnectionStatus(str, enum.Enum):
  PENDING = "pending"
  CONNECTED = "connected"
  FAILED = "failed"


class BankConnection(Base):
  __tablename__ = "bank_connections"

  id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  session_id: Mapped[uuid.UUID | None] = mapped_column(
    UUID(as_uuid=True), ForeignKey("ingest_sessions.id", ondelete="CASCADE"), nullable=True, index=True
  )
  bank_name: Mapped[str] = mapped_column(String(64), nullable=False)
  status: Mapped[BankConnectionStatus] = mapped_column(
    Enum(BankConnectionStatus, name="bank_connection_status"), default=BankConnectionStatus.PENDING, nullable=False
  )
  credentials: Mapped[dict | None] = mapped_column(JSON, nullable=True)
  error_message: Mapped[str | None] = mapped_column(String(500), nullable=True)
  last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

  session: Mapped["IngestSession"] = relationship(backref="bank_connections")

