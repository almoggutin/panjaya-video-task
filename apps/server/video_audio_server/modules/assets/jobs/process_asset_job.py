import asyncio
import json
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession
from video_audio_server.core.config import settings
from video_audio_server.core.db.session import AsyncSessionFactory
from video_audio_server.core.services.sse_service import SseService
from video_audio_server.core.storage.presign_service import PresignService
from video_audio_server.core.storage.storage_client import StorageClient
from video_audio_server.modules.assets.constants.assets_constants import (
    RESUMABLE_STATUSES,
)
from video_audio_server.modules.assets.entities.asset_entity import Asset
from video_audio_server.modules.assets.models.asset_sse_models import (
    ErrorEvent,
    ErrorEventData,
    ReadyEvent,
    ReadyEventData,
    StatusEvent,
    StatusEventData,
)
from video_audio_server.modules.assets.models.processing_status_model import (
    ProcessingStatus,
)
from video_audio_server.modules.assets.pipeline.extract import extract_audio
from video_audio_server.modules.assets.pipeline.magic import validate_magic_bytes
from video_audio_server.modules.assets.pipeline.mux import mux_video
from video_audio_server.modules.assets.pipeline.peaks import compute_peaks
from video_audio_server.modules.assets.pipeline.thumbnail import extract_thumbnail
from video_audio_server.modules.assets.pipeline.transform import transform_audio


def _get_duration(path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


async def _advance_stage(
    asset: Asset,
    session: AsyncSession,
    sse: SseService,
    user_id: str,
    asset_id: str,
    status: ProcessingStatus,
    progress: float,
) -> None:
    asset.status = status
    await session.commit()
    await sse.publish_status(
        user_id,
        StatusEvent(
            data=StatusEventData(
                asset_id=asset_id,
                state=status,
                progress=progress,
            )
        ),
    )


async def _upload_outputs(
    storage: StorageClient,
    user_id: str,
    asset_id: str,
    audio_path: Path,
    modified_path: Path,
    modified_video_path: Path,
    peaks_path: Path,
    thumbnail_path: Path,
    video_ext: str,
) -> tuple[str, str, str, str, str]:
    audio_key: str = f"{user_id}/{asset_id}/audio.m4a"
    modified_key: str = f"{user_id}/{asset_id}/modified.m4a"
    modified_video_key: str = f"{user_id}/{asset_id}/modified_video{video_ext}"
    peaks_key: str = f"{user_id}/{asset_id}/peaks.json"
    thumb_key: str = f"{user_id}/{asset_id}/thumbnail.jpg"

    meta = {"asset_id": asset_id, "user_id": user_id}
    await asyncio.gather(
        storage.upload_file(
            audio_key, audio_path, content_type="audio/mp4", metadata=meta
        ),
        storage.upload_file(
            modified_key, modified_path, content_type="audio/mp4", metadata=meta
        ),
        storage.upload_file(
            modified_video_key,
            modified_video_path,
            content_type="video/mp4",
            metadata=meta,
        ),
        storage.upload_file(
            peaks_key, peaks_path, content_type="application/json", metadata=meta
        ),
        storage.upload_file(
            thumb_key, thumbnail_path, content_type="image/jpeg", metadata=meta
        ),
    )
    return audio_key, modified_key, modified_video_key, peaks_key, thumb_key


async def _generate_urls(
    presign: PresignService,
    audio_key: str,
    modified_key: str,
    modified_video_key: str,
    peaks_key: str,
    thumb_key: str,
) -> tuple[str, str, str, str, str]:
    (
        audio_url,
        modified_url,
        modified_video_url,
        peaks_url,
        thumbnail_url,
    ) = await asyncio.gather(
        presign.generate_presigned_get(audio_key, settings.presigned_get_ttl),
        presign.generate_presigned_get(modified_key, settings.presigned_get_ttl),
        presign.generate_presigned_get(modified_video_key, settings.presigned_get_ttl),
        presign.generate_presigned_get(peaks_key, settings.presigned_get_ttl),
        presign.generate_presigned_get(thumb_key, settings.presigned_get_ttl),
    )
    return audio_url, modified_url, modified_video_url, peaks_url, thumbnail_url


async def _handle_failure(
    asset_id: str,
    user_id: str | None,
    sse: SseService,
    exc: Exception,
) -> None:
    async with AsyncSessionFactory() as session:
        asset = await session.get(Asset, asset_id)
        if asset is not None:
            asset.status = ProcessingStatus.FAILED
            asset.error_message = str(exc)
            await session.commit()
    if user_id:
        await sse.publish_status(
            user_id,
            ErrorEvent(
                data=ErrorEventData(
                    asset_id=asset_id,
                    code="PROCESSING_FAILED",
                    message=str(exc),
                )
            ),
        )


async def process_asset_job(ctx: dict[str, Any], asset_id: str) -> None:  # noqa: ARG001
    tmp_dir = Path(tempfile.mkdtemp())
    user_id: str | None = None
    sse = SseService()

    try:
        async with AsyncSessionFactory() as session:
            asset = await session.get(Asset, asset_id)

            if asset is None or asset.status not in RESUMABLE_STATUSES:
                return

            user_id = asset.user_id
            video_key = asset.video_key
            if not video_key:
                return

            video_path = tmp_dir / f"video{Path(video_key).suffix}"
            storage = StorageClient()
            presign = PresignService()

            await storage.download_file(video_key, video_path)
            validate_magic_bytes(video_path)

            await _advance_stage(
                asset, session, sse, user_id, asset_id, ProcessingStatus.EXTRACTING, 0.2
            )
            audio_path = await asyncio.to_thread(extract_audio, video_path)
            thumbnail_path = await asyncio.to_thread(extract_thumbnail, video_path)

            await _advance_stage(
                asset,
                session,
                sse,
                user_id,
                asset_id,
                ProcessingStatus.TRANSFORMING,
                0.5,
            )
            modified_path = await asyncio.to_thread(transform_audio, audio_path)

            await _advance_stage(
                asset, session, sse, user_id, asset_id, ProcessingStatus.FINALIZING, 0.8
            )
            modified_video_path = await asyncio.to_thread(
                mux_video, video_path, modified_path
            )
            peaks = await asyncio.to_thread(compute_peaks, audio_path)
            peaks_path = tmp_dir / "peaks.json"
            peaks_path.write_text(json.dumps(peaks))
            duration_sec = await asyncio.to_thread(_get_duration, audio_path)

            video_ext = Path(video_key).suffix
            (
                audio_key,
                modified_key,
                modified_video_key,
                peaks_key,
                thumb_key,
            ) = await _upload_outputs(
                storage,
                user_id,
                asset_id,
                audio_path,
                modified_path,
                modified_video_path,
                peaks_path,
                thumbnail_path,
                video_ext,
            )
            (
                audio_url,
                modified_url,
                modified_video_url,
                peaks_url,
                thumbnail_url,
            ) = await _generate_urls(
                presign,
                audio_key,
                modified_key,
                modified_video_key,
                peaks_key,
                thumb_key,
            )

            asset.status = ProcessingStatus.READY
            asset.audio_key = audio_key
            asset.modified_audio_key = modified_key
            asset.modified_video_key = modified_video_key
            asset.peaks_key = peaks_key
            asset.thumbnail_key = thumb_key
            asset.duration_sec = duration_sec
            await session.commit()

            await sse.publish_status(
                user_id,
                ReadyEvent(
                    data=ReadyEventData(
                        asset_id=asset_id,
                        audio_url=audio_url,
                        modified_audio_url=modified_url,
                        modified_video_url=modified_video_url,
                        peaks_url=peaks_url,
                        thumbnail_url=thumbnail_url,
                        duration_sec=duration_sec,
                    )
                ),
            )

    except Exception as exc:
        await _handle_failure(asset_id, user_id, sse, exc)
        raise

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)
