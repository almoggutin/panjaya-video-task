import json
from collections.abc import AsyncGenerator
from typing import Any

from pydantic import BaseModel
from redis.asyncio import Redis
from video_audio_server.core.config import settings


class SseService:
    def __init__(self) -> None:
        self._redis = Redis.from_url(settings.redis_url, decode_responses=True)

    async def publish_status(self, user_id: str, event: BaseModel) -> None:
        await self._redis.publish(f"user:{user_id}", event.model_dump_json())

    async def subscribe(self, user_id: str) -> AsyncGenerator[str, None]:
        pubsub = self._redis.pubsub()
        await pubsub.subscribe(f"user:{user_id}")
        try:
            async for message in pubsub.listen():
                if message["type"] != "message":
                    continue
                payload: dict[str, Any] = json.loads(message["data"])
                event_type: str = payload.get("event", "message")
                data: dict[str, Any] = payload.get("data", payload)
                yield f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
        finally:
            await pubsub.unsubscribe(f"user:{user_id}")
            await pubsub.aclose()
