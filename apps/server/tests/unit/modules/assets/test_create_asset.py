from unittest.mock import AsyncMock, MagicMock

import pytest
from video_audio_server.core.config import settings
from video_audio_server.core.models.error_models import UnprocessableError
from video_audio_server.core.storage.presign_service import PresignService
from video_audio_server.core.storage.storage_client import StorageClient
from video_audio_server.modules.assets.dtos.create_asset_request_dto import (
    CreateAssetRequest,
)
from video_audio_server.modules.assets.entities.asset_entity import Asset
from video_audio_server.modules.assets.repositories.asset_repository import (
    AssetRepository,
)
from video_audio_server.modules.assets.services.assets_service import AssetsService


def _make_service() -> tuple[AssetsService, AsyncMock, AsyncMock, AsyncMock]:
    repo = AsyncMock(spec=AssetRepository)
    presign = AsyncMock(spec=PresignService)
    storage = AsyncMock(spec=StorageClient)
    return AssetsService(repo, presign, storage), repo, presign, storage


def _make_asset(asset_id: str = "asset-1", user_id: str = "user-1") -> MagicMock:
    asset = MagicMock(spec=Asset)
    asset.id = asset_id
    asset.user_id = user_id
    asset.video_key = f"{user_id}/{asset_id}/video.mp4"
    return asset


@pytest.mark.asyncio
async def test_create_asset_rejects_unsupported_mime() -> None:
    service, *_ = _make_service()
    request = CreateAssetRequest(
        title="T", filename="f.png", size_bytes=100, mime_type="image/png"
    )

    with pytest.raises(UnprocessableError):
        await service.create_asset("user-1", request)


@pytest.mark.asyncio
async def test_create_asset_rejects_oversized_file() -> None:
    service, *_ = _make_service()
    request = CreateAssetRequest(
        title="T",
        filename="f.mp4",
        size_bytes=settings.max_upload_bytes + 1,
        mime_type="video/mp4",
    )

    with pytest.raises(UnprocessableError):
        await service.create_asset("user-1", request)


@pytest.mark.asyncio
async def test_create_asset_returns_asset_and_upload_url() -> None:
    service, repo, presign, _ = _make_service()
    asset = _make_asset()
    repo.create.return_value = asset
    presign.generate_presigned_put.return_value = "https://s3.example.com/upload"

    request = CreateAssetRequest(
        title="T", filename="clip.mp4", size_bytes=1024, mime_type="video/mp4"
    )
    result_asset, url = await service.create_asset("user-1", request)

    assert result_asset is asset
    assert url == "https://s3.example.com/upload"
    repo.create.assert_awaited_once()
