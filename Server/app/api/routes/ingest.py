from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas import (
  CSVIngestResponse,
  LiveBankConnectionRequest,
  LiveBankConnectionResponse,
)
from app.services.ingest import process_csv_upload, register_bank_connection

router = APIRouter(prefix="/ingest", tags=["ingest"])

ACCEPTED_CONTENT_TYPES = {"text/csv", "application/csv", "application/vnd.ms-excel"}


@router.get("/ping")
async def ingest_ping() -> dict[str, str]:
  return {"message": "ingest service online"}


@router.post("/csv", response_model=CSVIngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_csv(
  file: UploadFile = File(...),
  db: AsyncSession = Depends(get_session),
) -> CSVIngestResponse:
  if file.content_type not in ACCEPTED_CONTENT_TYPES:
    raise HTTPException(
      status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
      detail="Unsupported file type. Please upload a CSV file.",
    )

  ingest_session = await process_csv_upload(db, file)
  return CSVIngestResponse(
    session_id=ingest_session.id,
    source=ingest_session.source,
    status=ingest_session.status,
    records_ingested=ingest_session.records_ingested,
    created_at=ingest_session.created_at,
    updated_at=ingest_session.updated_at,
  )


@router.post("/live-api", response_model=LiveBankConnectionResponse, status_code=status.HTTP_201_CREATED)
async def connect_live_banks(
  payload: LiveBankConnectionRequest,
  db: AsyncSession = Depends(get_session),
) -> LiveBankConnectionResponse:
  connections = []
  for bank_name, credentials in payload.bank_credentials.items():
    connection = await register_bank_connection(
      db,
      bank_name=bank_name,
      credentials=credentials,
      session_id=None,
    )
    connections.append(connection)

  return LiveBankConnectionResponse(
    connections=[
      LiveBankConnectionResponse.Connection(
        id=connection.id,
        bank_name=connection.bank_name,
        status=connection.status,
        last_synced_at=connection.last_synced_at,
        created_at=connection.created_at,
      )
      for connection in connections
    ]
  )

