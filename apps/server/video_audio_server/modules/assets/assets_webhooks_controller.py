from arq import ArqRedis
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from video_audio_server.modules.assets.services.assets_webhooks_service import (
    handle_s3_event,
)
from video_audio_server.shared.dependencies.arq import get_arq_pool
from video_audio_server.shared.dependencies.db import get_db
from video_audio_server.shared.dependencies.worker_auth import verify_worker_secret
from video_audio_server.shared.dtos.s3_event_dto import S3Event

router = APIRouter(
    prefix="/webhooks", tags=["assets-webhooks"], include_in_schema=False
)


@router.post(
    "/s3-event",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(verify_worker_secret)],
)
async def s3_event(
    body: S3Event,
    db: AsyncSession = Depends(get_db),
    arq: ArqRedis = Depends(get_arq_pool),
) -> None:
    await handle_s3_event(body, db, arq)
