from redis.asyncio import Redis
from video_audio_server.core.config import settings
from video_audio_server.modules.auth.constants.auth_constants import JTI_REDIS_PREFIX


class JtiRepository:
    def __init__(self, redis: Redis) -> None:
        self._redis = redis

    async def store(self, jti: str) -> None:
        await self._redis.setex(
            f"{JTI_REDIS_PREFIX}{jti}", settings.jwt_access_ttl_seconds, "1"
        )

    async def exists(self, jti: str) -> bool:
        return bool(await self._redis.exists(f"{JTI_REDIS_PREFIX}{jti}"))

    async def delete(self, jti: str) -> None:
        await self._redis.delete(f"{JTI_REDIS_PREFIX}{jti}")
