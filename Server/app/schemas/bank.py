from __future__ import annotations

from datetime import datetime
from typing import Dict, List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.bank_connection import BankConnectionStatus


class BankCredential(BaseModel):
  api_key: str = Field(..., min_length=8, description="API key provisioned by the bank portal")


class LiveBankConnectionRequest(BaseModel):
  bank_credentials: Dict[str, BankCredential]

  @field_validator("bank_credentials")
  @classmethod
  def ensure_supported_banks(cls, value: Dict[str, BankCredential]) -> Dict[str, BankCredential]:
    supported = {"hdfc", "icici", "axis", "kotak"}
    unsupported = set(value.keys()) - supported
    if unsupported:
      raise ValueError(f"Unsupported banks requested: {', '.join(sorted(unsupported))}")
    return value


class LiveBankConnectionResponse(BaseModel):
  class Connection(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    bank_name: str
    status: BankConnectionStatus
    created_at: datetime
    last_synced_at: datetime | None = None

  connections: List[Connection]

