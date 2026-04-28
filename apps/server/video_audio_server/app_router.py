import os
import platform

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from redis.asyncio import Redis
from sqlalchemy import text
from video_audio_server.core.config import settings
from video_audio_server.core.db.session import AsyncSessionFactory
from video_audio_server.core.models.app_models import (
    AppStatusResponse,
    LivenessResponse,
    ReadinessResponse,
    RootResponse,
)

router = APIRouter(tags=["health"])


@router.get("/")
async def root() -> RootResponse:
    return RootResponse(message="Hello from the Panjaya Video API")


@router.get("/live")
async def liveness() -> LivenessResponse:
    return LivenessResponse(status="ok")


@router.get("/ready")
async def readiness() -> JSONResponse:
    errors: list[str] = []

    try:
        async with AsyncSessionFactory() as session:
            await session.execute(text("SELECT 1"))
    except Exception:
        errors.append("postgres")

    try:
        redis: Redis = Redis.from_url(settings.redis_url)
        await redis.ping()
        await redis.aclose()
    except Exception:
        errors.append("redis")

    if errors:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=ReadinessResponse(
                status="unavailable", failing=errors
            ).model_dump(),
        )

    return JSONResponse(content=ReadinessResponse(status="ok").model_dump())


@router.get("/status")
async def app_status() -> AppStatusResponse:
    page_size: int = os.sysconf("SC_PAGE_SIZE")
    avail_pages: int = os.sysconf("SC_AVPHYS_PAGES")
    free_ram_mb: int = (page_size * avail_pages) // (1024 * 1024)

    return AppStatusResponse(
        name="Panjaya Video API",
        description="Video upload and audio transformation service",
        environment=settings.environment,
        os=f"{platform.system()} {platform.release()}",
        free_ram_mb=free_ram_mb,
    )
