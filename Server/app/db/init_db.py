from __future__ import annotations

import asyncio

from app.db.session import Base, engine
from app.models import (  # noqa: F401  # ensure metadata import
  AgentFailure,
  BankConnection,
  ComplianceCheck,
  ExplainabilityCache,
  FraudFlag,
  IngestSession,
  RouteSelection,
  Transaction,
)


async def init_models() -> None:
  async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)


if __name__ == "__main__":
  asyncio.run(init_models())

