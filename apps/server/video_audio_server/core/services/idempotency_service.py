import json
from typing import Any

from video_audio_server.core.constants.idempotency_constants import (
    IDEMPOTENCY_LOCK_PREFIX,
    IDEMPOTENCY_LOCK_TTL,
    IDEMPOTENCY_PREFIX,
    IDEMPOTENCY_TTL,
)
from video_audio_server.core.services.cache_service import CacheService


class IdempotencyService:
    def __init__(self, cache: CacheService) -> None:
        self._cache = cache

    async def get(self, key: str) -> dict[str, Any] | None:
        raw = await self._cache.get(f"{IDEMPOTENCY_PREFIX}{key}")
        if raw is None:
            return None
        return json.loads(raw)

    async def set(self, key: str, data: dict[str, Any]) -> None:
        await self._cache.set(
            f"{IDEMPOTENCY_PREFIX}{key}", json.dumps(data), IDEMPOTENCY_TTL
        )

    async def is_in_flight(self, key: str) -> bool:
        return await self._cache.exists(f"{IDEMPOTENCY_LOCK_PREFIX}{key}")

    async def lock(self, key: str) -> None:
        await self._cache.set(
            f"{IDEMPOTENCY_LOCK_PREFIX}{key}", "1", IDEMPOTENCY_LOCK_TTL
        )

    async def unlock(self, key: str) -> None:
        await self._cache.delete(f"{IDEMPOTENCY_LOCK_PREFIX}{key}")

    async def close(self) -> None:
        await self._cache.close()
