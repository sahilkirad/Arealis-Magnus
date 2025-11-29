from __future__ import annotations

from typing import Any

from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import settings


class Base(DeclarativeBase):
  pass


def _build_engine() -> AsyncEngine:
  engine_kwargs: dict[str, Any] = {"echo": False, "future": True, "pool_pre_ping": True}

  if settings.database_url.startswith("sqlite"):
    engine_kwargs["poolclass"] = NullPool
    engine_kwargs["connect_args"] = {"timeout": 30}

  async_engine = create_async_engine(settings.database_url, **engine_kwargs)

  if settings.database_url.startswith("sqlite"):

    @event.listens_for(async_engine.sync_engine, "connect")
    def _set_sqlite_pragmas(dbapi_connection, connection_record) -> None:  # type: ignore[override]
      cursor = dbapi_connection.cursor()
      cursor.execute("PRAGMA foreign_keys=ON")
      cursor.execute("PRAGMA journal_mode=WAL")
      cursor.execute("PRAGMA synchronous=NORMAL")
      cursor.execute("PRAGMA busy_timeout=3000")
      cursor.close()

  return async_engine


engine = _build_engine()
async_session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_session() -> AsyncSession:
  async with async_session_factory() as session:
    yield session

