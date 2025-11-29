from __future__ import annotations

import csv
import io
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import Iterable
from uuid import UUID

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
  BankConnection,
  BankConnectionStatus,
  IngestSession,
  IngestSource,
  IngestStatus,
  Transaction,
)

LIVE_BANK_REQUIRED_FIELDS = {
  "hdfc": ["api_key"],
  "icici": ["api_key"],
  "axis": ["api_key"],
  "kotak": ["api_key"],
}

REQUIRED_HEADERS = [
  "date",
  "vendor_id",
  "vendor_name",
  "amount",
  "currency",
  "payment_method",
  "bank_name",
  "gst_number",
  "pan_number",
  "payment_purpose",
  "receiving_bank",
  "receiving_account",
  "country",
]

OPTIONAL_STRING_FIELDS = {"gst_number", "pan_number", "payment_purpose"}


def _clean_optional(value: str | None) -> str | None:
  if value is None:
    return None
  value = value.strip()
  return value or None


def _parse_decimal(value: str) -> Decimal:
  try:
    return Decimal(str(value))
  except (InvalidOperation, TypeError) as exc:
    raise ValueError("Invalid amount") from exc


def _parse_date(value: str) -> datetime.date:
  try:
    return datetime.strptime(value.strip(), "%Y-%m-%d").date()
  except (ValueError, AttributeError) as exc:
    raise ValueError("Invalid date format, expected YYYY-MM-DD") from exc


def _validate_headers(headers: Iterable[str]) -> list[str]:
  header_set = {h.strip() for h in headers if h}
  missing = [header for header in REQUIRED_HEADERS if header not in header_set]
  return missing


async def _mark_session_failure(db: AsyncSession, session_id: UUID, message: str) -> None:
  await db.execute(
    update(IngestSession)
    .where(IngestSession.id == session_id)
    .values(status=IngestStatus.FAILED, error_message=message[:500])
  )
  await db.commit()


async def process_csv_upload(db: AsyncSession, upload: UploadFile) -> IngestSession:
  ingest_session = IngestSession(source=IngestSource.CSV, status=IngestStatus.PROCESSING)
  db.add(ingest_session)
  await db.flush()

  raw_bytes = await upload.read()
  upload.file.seek(0)

  try:
    text_stream = io.StringIO(raw_bytes.decode("utf-8-sig"))
    reader = csv.DictReader(text_stream)
  except UnicodeDecodeError as exc:
    await db.rollback()
    await _mark_session_failure(db, ingest_session.id, "Unable to decode CSV file as UTF-8")
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to decode CSV file as UTF-8") from exc

  if reader.fieldnames is None:
    await db.rollback()
    await _mark_session_failure(db, ingest_session.id, "CSV file missing header row")
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="CSV file missing header row")

  missing_headers = _validate_headers(reader.fieldnames)
  if missing_headers:
    await db.rollback()
    await _mark_session_failure(
      db,
      ingest_session.id,
      f"Missing required headers: {', '.join(missing_headers)}",
    )
    raise HTTPException(
      status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
      detail={"missing_headers": missing_headers},
    )

  transactions: list[Transaction] = []
  try:
    for index, row in enumerate(reader, start=1):
      if not any(row.values()):
        # skip empty line
        continue
      try:
        transaction = Transaction(
          session_id=ingest_session.id,
          date=_parse_date(row["date"]),
          vendor_id=row["vendor_id"].strip(),
          vendor_name=row["vendor_name"].strip(),
          amount=_parse_decimal(row["amount"]),
          currency=row["currency"].strip(),
          payment_method=row["payment_method"].strip(),
          bank_name=row["bank_name"].strip(),
          gst_number=_clean_optional(row.get("gst_number")),
          pan_number=_clean_optional(row.get("pan_number")),
          payment_purpose=_clean_optional(row.get("payment_purpose")),
          receiving_bank=row["receiving_bank"].strip(),
          receiving_account=row["receiving_account"].strip(),
          country=row["country"].strip(),
        )
      except (KeyError, ValueError) as exc:
        raise ValueError(f"Row {index}: {exc}") from exc

      transactions.append(transaction)

    if not transactions:
      raise ValueError("CSV file contained no data rows.")

    db.add_all(transactions)
    ingest_session.records_ingested = len(transactions)
    ingest_session.status = IngestStatus.COMPLETED
    await db.commit()
    await db.refresh(ingest_session)
    return ingest_session

  except ValueError as exc:
    await db.rollback()
    await _mark_session_failure(db, ingest_session.id, str(exc))
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
  except Exception as exc:  # pragma: no cover - safeguard
    await db.rollback()
    await _mark_session_failure(db, ingest_session.id, "Internal ingest failure")
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to ingest CSV") from exc
  finally:
    upload.file.seek(0)


async def register_bank_connection(
  db: AsyncSession,
  bank_name: str,
  credentials: dict[str, str],
  session_id: UUID | None = None,
) -> BankConnection:
  required_fields = LIVE_BANK_REQUIRED_FIELDS.get(bank_name.lower())
  if required_fields:
    missing = [field for field in required_fields if not credentials.get(field)]
    if missing:
      raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=f"{bank_name} requires fields: {', '.join(required_fields)}",
      )

  connection = BankConnection(
    session_id=session_id,
    bank_name=bank_name,
    status=BankConnectionStatus.CONNECTED,
    credentials=credentials,
  )
  db.add(connection)
  await db.commit()
  await db.refresh(connection)
  return connection

