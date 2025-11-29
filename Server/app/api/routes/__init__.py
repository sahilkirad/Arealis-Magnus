from fastapi import APIRouter

from . import agent_pipeline, dashboard, ingest

router = APIRouter()
router.include_router(ingest.router)
router.include_router(dashboard.router)
router.include_router(agent_pipeline.router)
