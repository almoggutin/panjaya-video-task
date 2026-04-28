from fastapi import APIRouter, Depends, Query, status
from video_audio_server.core.storage.presign_service import PresignService
from video_audio_server.modules.assets.assets_events_controller import (
    router as events_router,
)
from video_audio_server.modules.assets.assets_webhooks_controller import (
    router as webhooks_router,
)
from video_audio_server.modules.assets.constants.assets_constants import (
    DEFAULT_PAGE_LIMIT,
    MAX_PAGE_LIMIT,
)
from video_audio_server.modules.assets.dtos.asset_response_dto import (
    AssetResponse,
    PaginatedAssetsResponse,
)
from video_audio_server.modules.assets.dtos.create_asset_request_dto import (
    CreateAssetRequest,
)
from video_audio_server.modules.assets.dtos.presigned_upload_response_dto import (
    PresignedUploadResponse,
)
from video_audio_server.modules.assets.services.assets_service import AssetsService
from video_audio_server.modules.users.entities.user_entity import User
from video_audio_server.shared.dependencies.auth import get_current_user
from video_audio_server.shared.dependencies.services import (
    get_assets_service,
    get_presign_service,
)

router = APIRouter(prefix="/assets", tags=["assets"])
router.include_router(webhooks_router)
router.include_router(events_router)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_asset(
    request: CreateAssetRequest,
    current_user: User = Depends(get_current_user),
    service: AssetsService = Depends(get_assets_service),
) -> PresignedUploadResponse:
    asset, upload_url = await service.create_asset(current_user.id, request)
    return PresignedUploadResponse(asset_id=asset.id, upload_url=upload_url)


@router.get("")
async def list_assets(
    page: int = 1,
    limit: int = DEFAULT_PAGE_LIMIT,
    sort_key: str = Query(default="createdAt", alias="sortKey"),
    sort_dir: str = Query(default="desc", alias="sortDir"),
    search: str | None = None,
    current_user: User = Depends(get_current_user),
    service: AssetsService = Depends(get_assets_service),
    presign: PresignService = Depends(get_presign_service),
) -> PaginatedAssetsResponse:
    limit = min(limit, MAX_PAGE_LIMIT)

    assets, total = await service.list_assets(
        current_user.id, page, limit, sort_key, sort_dir, search
    )
    items = await AssetResponse.from_many(assets, presign)
    return PaginatedAssetsResponse.from_page(
        items=items, total=total, page=page, limit=limit
    )


@router.get("/{asset_id}")
async def get_asset(
    asset_id: str,
    current_user: User = Depends(get_current_user),
    service: AssetsService = Depends(get_assets_service),
    presign: PresignService = Depends(get_presign_service),
) -> AssetResponse:
    asset = await service.get_asset(current_user.id, asset_id)
    return await AssetResponse.from_entity(asset, presign)


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asset(
    asset_id: str,
    current_user: User = Depends(get_current_user),
    service: AssetsService = Depends(get_assets_service),
) -> None:
    await service.delete_asset(current_user.id, asset_id)
