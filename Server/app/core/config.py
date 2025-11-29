from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

  app_name: str = "Arealis Magnus Ingest API"
  version: str = "0.1.0"
  api_prefix: str = "/api/v1"

  database_url: str = Field(
    default="sqlite+aiosqlite:///./arealis_magnus.db",
    validation_alias=AliasChoices("DATABASE_URL", "POSTGRES_DSN"),
  )
  faiss_index_path: str = "/data/faiss/explainability.index"
  explainability_embedding_dim: int = 32
  cors_origins: List[str] = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
  ]

  @field_validator("cors_origins", mode="before")
  @classmethod
  def parse_cors_origins(cls, value: str | List[str]) -> List[str]:
    if isinstance(value, str):
      value = value.strip()
      if value.startswith("["):
        # expecting JSON-style list
        import json

        return json.loads(value)
      return [origin.strip() for origin in value.split(",") if origin.strip()]
    return value


@lru_cache(maxsize=1)
def get_settings() -> Settings:
  return Settings()


settings = get_settings()

