from fastapi import Request, status
from fastapi.responses import JSONResponse, Response
from starlette.middleware.base import RequestResponseEndpoint
from video_audio_server.core.config import settings


async def limit_request_size(
    request: Request, call_next: RequestResponseEndpoint
) -> Response:
    content_length = request.headers.get("Content-Length")
    if content_length and int(content_length) > settings.max_request_body_bytes:
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={"detail": "Request body too large"},
        )
    return await call_next(request)
