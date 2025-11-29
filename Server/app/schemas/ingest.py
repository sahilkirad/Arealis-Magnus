from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.ingest_session import IngestSource, IngestStatus


class IngestSessionResponse(BaseModel):
  model_config = ConfigDict(from_attributes=True)

  session_id: UUID
  source: IngestSource
  status: IngestStatus
  records_ingested: int
  created_at: datetime
  updated_at: datetime


class CSVIngestResponse(IngestSessionResponse):
  pass

