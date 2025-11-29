from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.ingest_session import IngestSession


class Transaction(Base):
  __tablename__ = "transactions"

  id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
  )
  session_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), ForeignKey("ingest_sessions.id", ondelete="CASCADE"), nullable=False, index=True
  )
  date: Mapped[date] = mapped_column(Date, nullable=False)
  vendor_id: Mapped[str] = mapped_column(String(64), nullable=False)
  vendor_name: Mapped[str] = mapped_column(String(255), nullable=False)
  amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
  currency: Mapped[str] = mapped_column(String(16), nullable=False)
  payment_method: Mapped[str] = mapped_column(String(32), nullable=False)
  bank_name: Mapped[str] = mapped_column(String(64), nullable=False)
  gst_number: Mapped[str | None] = mapped_column(String(32), nullable=True)
  pan_number: Mapped[str | None] = mapped_column(String(32), nullable=True)
  payment_purpose: Mapped[str | None] = mapped_column(String(255), nullable=True)
  receiving_bank: Mapped[str] = mapped_column(String(64), nullable=False)
  receiving_account: Mapped[str] = mapped_column(String(64), nullable=False)
  country: Mapped[str] = mapped_column(String(64), nullable=False)
  extra_metadata: Mapped[str | None] = mapped_column(Text, nullable=True)
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

  session: Mapped["IngestSession"] = relationship(backref="transactions")

