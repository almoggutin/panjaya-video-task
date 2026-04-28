import json
from typing import cast

from fastapi import Request, status
from fastapi.responses import JSONResponse, Response
from starlette.middleware.base import RequestResponseEndpoint
from starlette.responses import StreamingResponse
from starlette.routing import Match
from video_audio_server.core.config import settings
from video_audio_server.core.constants.idempotency_constants import IDEMPOTENT_METHODS
from video_audio_server.core.decorators.skip_idempotency import SKIP_IDEMPOTENCY_ATTR
from video_audio_server.core.services.cache_service import CacheService
from video_audio_server.core.services.idempotency_service import IdempotencyService


def _is_skipped(request: Request) -> bool:
    for route in request.app.routes:
        match, _ = route.matches(request.scope)
        if match != Match.NONE:
            return bool(
                getattr(getattr(route, "endpoint", None), SKIP_IDEMPOTENCY_ATTR, False)
            )
    return False


async def idempotency_middleware(
    request: Request, call_next: RequestResponseEndpoint
) -> Response:
    idempotency_key: str | None = request.headers.get("idempotency-key")

    if (
        not idempotency_key
        or request.method not in IDEMPOTENT_METHODS
        or _is_skipped(request)
    ):
        return await call_next(request)

    service = IdempotencyService(CacheService(settings.redis_url))

    try:
        if await service.is_in_flight(idempotency_key):
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={"detail": "Request already in flight"},
            )

        cached = await service.get(idempotency_key)
        if cached:
            return JSONResponse(
                status_code=cached["status_code"],
                content=cached["body"],
            )

        await service.lock(idempotency_key)
        try:
            response = cast(StreamingResponse, await call_next(request))
        finally:
            await service.unlock(idempotency_key)

        if response.status_code < 300:
            chunks: list[bytes] = []
            async for chunk in response.body_iterator:
                if isinstance(chunk, str):
                    chunks.append(chunk.encode())
                else:
                    chunks.append(chunk)
            body_bytes: bytes = b"".join(chunks)

            await service.set(
                idempotency_key,
                {
                    "status_code": response.status_code,
                    "body": json.loads(body_bytes.decode()),
                },
            )

            headers = dict(response.headers)
            headers.pop("content-length", None)
            return Response(
                content=body_bytes,
                status_code=response.status_code,
                headers=headers,
                media_type=response.media_type,
            )

        return response
    finally:
        await service.close()
