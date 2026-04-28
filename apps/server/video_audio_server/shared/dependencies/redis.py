from collections.abc import AsyncGenerator

from redis.asyncio import Redis
from video_audio_server.core.config import settings


async def get_redis() -> AsyncGenerator[Redis, None]:
    client: Redis = Redis.from_url(settings.redis_url, decode_responses=True)
    try:
        yield client
    finally:
        await client.aclose()
