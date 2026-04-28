from collections.abc import AsyncGenerator

from arq import ArqRedis, create_pool
from arq.connections import RedisSettings
from video_audio_server.core.config import settings


async def get_arq_pool() -> AsyncGenerator[ArqRedis, None]:
    pool = await create_pool(RedisSettings.from_dsn(settings.redis_url))
    try:
        yield pool
    finally:
        await pool.aclose()
