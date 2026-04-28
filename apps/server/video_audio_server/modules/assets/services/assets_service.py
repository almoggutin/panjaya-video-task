import os

from sqlalchemy import asc, desc
from video_audio_server.core.config import settings
from video_audio_server.core.models.error_models import (
    ForbiddenError,
    NotFoundError,
    UnprocessableError,
)
from video_audio_server.core.storage.presign_service import PresignService
from video_audio_server.core.storage.storage_client import StorageClient
from video_audio_server.modules.assets.constants.assets_constants import (
    SORT_COLUMNS,
    SUPPORTED_MIME_TYPES,
)
from video_audio_server.modules.assets.dtos.asset_create_dto import AssetCreateData
from video_audio_server.modules.assets.dtos.create_asset_request_dto import (
    CreateAssetRequest,
)
from video_audio_server.modules.assets.entities.asset_entity import Asset
from video_audio_server.modules.assets.models.processing_status_model import (
    ProcessingStatus,
)
from video_audio_server.modules.assets.repositories.asset_repository import (
    AssetRepository,
)


class AssetsService:
    def __init__(
        self,
        asset_repo: AssetRepository,
        presign_service: PresignService,
        storage_client: StorageClient,
    ) -> None:
        self._asset_repo = asset_repo
        self._presign_service = presign_service
        self._storage_client = storage_client

    async def create_asset(
        self, user_id: str, request: CreateAssetRequest
    ) -> tuple[Asset, str]:
        if request.mime_type not in SUPPORTED_MIME_TYPES:
            raise UnprocessableError(f"Unsupported MIME type: {request.mime_type}")

        if request.size_bytes > settings.max_upload_bytes:
            raise UnprocessableError(
                f"File exceeds maximum size of {settings.max_upload_bytes} bytes"
            )

        _, ext = os.path.splitext(request.filename)
        format: str = ext.lstrip(".").upper() if ext else ""
        asset = await self._asset_repo.create(
            AssetCreateData(
                user_id=user_id,
                title=request.title,
                description=request.description,
                original_filename=request.filename,
                format=format,
                size_bytes=request.size_bytes,
            )
        )

        video_key = f"{user_id}/{asset.id}/video{ext}"
        asset.video_key = video_key
        await self._asset_repo.commit()

        upload_url = await self._presign_service.generate_presigned_put(
            key=video_key,
            ttl=settings.presigned_put_ttl,
        )

        return asset, upload_url

    async def list_assets(
        self,
        user_id: str,
        page: int,
        limit: int,
        sort_key: str = "createdAt",
        sort_dir: str = "desc",
        search: str | None = None,
    ) -> tuple[list[Asset], int]:
        offset = (page - 1) * limit
        filters = [
            Asset.user_id == user_id,
            Asset.status != ProcessingStatus.PENDING_UPLOAD,
        ]
        if search:
            filters.append(Asset.title.ilike(f"%{search}%"))

        sort_col = SORT_COLUMNS.get(sort_key, Asset.created_at)
        order_by = desc(sort_col) if sort_dir == "desc" else asc(sort_col)

        return await self._asset_repo.get_all(
            offset, limit, *filters, order_by=order_by
        )

    async def get_asset(self, user_id: str, asset_id: str) -> Asset:
        asset = await self._asset_repo.find_by_id(asset_id)
        if asset is None:
            raise NotFoundError("Asset not found")

        if asset.user_id != user_id:
            raise ForbiddenError("Access denied")

        return asset

    async def delete_asset(self, user_id: str, asset_id: str) -> None:
        asset = await self._asset_repo.find_by_id(asset_id)
        if asset is None:
            raise NotFoundError("Asset not found")

        if asset.user_id != user_id:
            raise ForbiddenError("Access denied")

        for key in (
            asset.video_key,
            asset.audio_key,
            asset.modified_audio_key,
            asset.peaks_key,
        ):
            if key:
                await self._storage_client.delete_object(key)

        await self._asset_repo.delete(asset)
        await self._asset_repo.commit()
