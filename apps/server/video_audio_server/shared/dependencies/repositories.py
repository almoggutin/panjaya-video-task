from fastapi import Depends
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from video_audio_server.modules.assets.repositories.asset_repository import (
    AssetRepository,
)
from video_audio_server.modules.auth.repositories.jti_repository import JtiRepository
from video_audio_server.modules.auth.repositories.refresh_token_repository import (
    RefreshTokenRepository,
)
from video_audio_server.modules.users.repositories.user_repository import UserRepository
from video_audio_server.shared.dependencies.db import get_db
from video_audio_server.shared.dependencies.redis import get_redis


async def get_user_repository(db: AsyncSession = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


async def get_refresh_token_repository(
    db: AsyncSession = Depends(get_db),
) -> RefreshTokenRepository:
    return RefreshTokenRepository(db)


async def get_jti_repository(redis: Redis = Depends(get_redis)) -> JtiRepository:
    return JtiRepository(redis)


async def get_asset_repository(db: AsyncSession = Depends(get_db)) -> AssetRepository:
    return AssetRepository(db)
