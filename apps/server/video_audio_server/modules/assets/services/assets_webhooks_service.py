from typing import Any, cast
from urllib.parse import unquote_plus

from arq import ArqRedis
from sqlalchemy import update
from sqlalchemy.engine import CursorResult
from sqlalchemy.ext.asyncio import AsyncSession
from video_audio_server.modules.assets.entities.asset_entity import Asset
from video_audio_server.modules.assets.models.processing_status_model import (
    ProcessingStatus,
)
from video_audio_server.shared.dtos.s3_event_dto import S3Event


async def handle_s3_event(body: S3Event, db: AsyncSession, arq: ArqRedis) -> None:
    for record in body.records:
        # Key format: {user_id}/{asset_id}/video.{ext}
        parts = unquote_plus(record.s3.object.key).split("/")
        if len(parts) < 2:
            continue
        asset_id = parts[1]

        result = cast(
            CursorResult[Any],
            await db.execute(
                update(Asset)
                .where(
                    Asset.id == asset_id,
                    Asset.status == ProcessingStatus.PENDING_UPLOAD,
                )
                .values(status=ProcessingStatus.QUEUED)
            ),
        )
        if result.rowcount == 0:
            continue

        await db.commit()
        await arq.enqueue_job("process_asset_job", asset_id)
