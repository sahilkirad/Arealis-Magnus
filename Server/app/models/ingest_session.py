from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, Integer, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
  from app.models.compliance_check import ComplianceCheck

from app.db.session import Base


class IngestSource(str, enum.Enum):
  CSV = "csv"
  LIVE = "live"


class IngestStatus(str, enum.Enum):
  RECEIVED = "received"
  PROCESSING = "processing"
  COMPLETED = "completed"
  FAILED = "failed"


class IngestSession(Base):
  __tablename__ = "ingest_sessions"

  id: Mapped[uuid.UUID] = mapped_column(
    Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
  )
  source: Mapped[IngestSource] = mapped_column(Enum(IngestSource, name="ingest_source"), nullable=False)
  status: Mapped[IngestStatus] = mapped_column(
    Enum(IngestStatus, name="ingest_status"), nullable=False, default=IngestStatus.RECEIVED
  )
  records_ingested: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
  error_message: Mapped[str | None] = mapped_column(String(500), nullable=True)
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
  updated_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
  )

  compliance_checks: Mapped[list["ComplianceCheck"]] = relationship(
    back_populates="ingest_session",
    cascade="all, delete-orphan",
    passive_deletes=True,
  )

