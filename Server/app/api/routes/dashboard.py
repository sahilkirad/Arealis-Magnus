from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard import DashboardNotFoundError, build_dashboard_response

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/{session_id}", response_model=DashboardResponse)
async def get_dashboard_snapshot(session_id: UUID, db: AsyncSession = Depends(get_session)) -> DashboardResponse:
  try:
    snapshot = await build_dashboard_response(db, session_id=session_id)
  except DashboardNotFoundError as exc:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
  return DashboardResponse(**snapshot)

