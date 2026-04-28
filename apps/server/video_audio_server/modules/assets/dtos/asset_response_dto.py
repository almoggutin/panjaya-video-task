from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from video_audio_server.core.config import settings
from video_audio_server.shared.dtos.paginated_response_dto import PaginatedResponse

if TYPE_CHECKING:
    from video_audio_server.core.storage.presign_service import PresignService
    from video_audio_server.modules.assets.entities.asset_entity import Asset


class AssetResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    id: str
    title: str
    description: str | None
    original_filename: str
    format: str
    size_bytes: int | None
    duration_sec: float | None
    status: str
    video_url: str | None
    audio_url: str | None
    modified_audio_url: str | None
    modified_video_url: str | None
    peaks_url: str | None
    thumbnail_url: str | None
    error_message: str | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    async def from_entity(cls, asset: Asset, presign: PresignService) -> AssetResponse:
        async def _sign(key: str | None) -> str | None:
            return (
                await presign.generate_presigned_get(key, settings.presigned_get_ttl)
                if key
                else None
            )

        return cls(
            id=asset.id,
            title=asset.title,
            description=asset.description,
            original_filename=asset.original_filename,
            format=asset.format,
            size_bytes=asset.size_bytes,
            duration_sec=asset.duration_sec,
            status=asset.status,
            video_url=await _sign(asset.video_key),
            audio_url=await _sign(asset.audio_key),
            modified_audio_url=await _sign(asset.modified_audio_key),
            modified_video_url=await _sign(asset.modified_video_key),
            peaks_url=await _sign(asset.peaks_key),
            thumbnail_url=await _sign(asset.thumbnail_key),
            error_message=asset.error_message,
            created_at=asset.created_at,
            updated_at=asset.updated_at,
        )

    @classmethod
    async def from_many(
        cls, assets: list[Asset], presign: PresignService
    ) -> list[AssetResponse]:
        return [await cls.from_entity(a, presign) for a in assets]


class PaginatedAssetsResponse(PaginatedResponse[AssetResponse]):
    pass
