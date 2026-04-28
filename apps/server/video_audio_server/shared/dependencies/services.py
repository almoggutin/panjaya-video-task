from fastapi import Depends
from video_audio_server.core.services.sse_service import SseService
from video_audio_server.core.storage.presign_service import PresignService
from video_audio_server.core.storage.storage_client import StorageClient
from video_audio_server.modules.assets.repositories.asset_repository import (
    AssetRepository,
)
from video_audio_server.modules.assets.services.assets_service import AssetsService
from video_audio_server.modules.auth.repositories.jti_repository import JtiRepository
from video_audio_server.modules.auth.repositories.refresh_token_repository import (
    RefreshTokenRepository,
)
from video_audio_server.modules.auth.services.auth_service import AuthService
from video_audio_server.modules.auth.services.token_service import TokenService
from video_audio_server.modules.users.repositories.user_repository import UserRepository
from video_audio_server.modules.users.services.users_service import UsersService
from video_audio_server.shared.dependencies.repositories import (
    get_asset_repository,
    get_jti_repository,
    get_refresh_token_repository,
    get_user_repository,
)
from video_audio_server.shared.dependencies.storage import (
    get_presign_service,
    get_s3_client,
)


def get_sse_service() -> SseService:
    return SseService()


async def get_token_service(
    token_repo: RefreshTokenRepository = Depends(get_refresh_token_repository),
    jti_repo: JtiRepository = Depends(get_jti_repository),
) -> TokenService:
    return TokenService(token_repo, jti_repo)


async def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repository),
    token_service: TokenService = Depends(get_token_service),
) -> AuthService:
    return AuthService(user_repo, token_service)


async def get_users_service(
    user_repo: UserRepository = Depends(get_user_repository),
) -> UsersService:
    return UsersService(user_repo)


async def get_assets_service(
    asset_repo: AssetRepository = Depends(get_asset_repository),
    presign_service: PresignService = Depends(get_presign_service),
    storage_client: StorageClient = Depends(get_s3_client),
) -> AssetsService:
    return AssetsService(asset_repo, presign_service, storage_client)
