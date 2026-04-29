from unittest.mock import AsyncMock, MagicMock

import pytest
from video_audio_server.core.models.error_models import ForbiddenError, NotFoundError
from video_audio_server.core.storage.presign_service import PresignService
from video_audio_server.core.storage.storage_client import StorageClient
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
    asset.audio_key = None
    asset.modified_audio_key = None
    asset.peaks_key = None
    asset.thumbnail_key = None
    return asset


@pytest.mark.asyncio
async def test_delete_asset_not_found_raises() -> None:
    service, repo, *_ = _make_service()
    repo.find_by_id.return_value = None

    with pytest.raises(NotFoundError):
        await service.delete_asset("user-1", "missing")


@pytest.mark.asyncio
async def test_delete_asset_wrong_owner_raises_forbidden() -> None:
    service, repo, *_ = _make_service()
    repo.find_by_id.return_value = _make_asset(user_id="other-user")

    with pytest.raises(ForbiddenError):
        await service.delete_asset("user-1", "asset-1")


@pytest.mark.asyncio
async def test_delete_asset_removes_s3_objects_and_db_record() -> None:
    service, repo, _, storage = _make_service()
    asset = _make_asset(user_id="user-1")
    repo.find_by_id.return_value = asset

    await service.delete_asset("user-1", "asset-1")

    storage.delete_object.assert_awaited()
    repo.delete.assert_awaited_once_with(asset)
    repo.commit.assert_awaited_once()
