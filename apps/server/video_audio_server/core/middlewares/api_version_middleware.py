from fastapi import Request, status
from fastapi.responses import JSONResponse, Response
from starlette.middleware.base import RequestResponseEndpoint
from video_audio_server.core.config import settings

_SKIP_PATHS = {"/", "/live", "/ready", "/status", "/docs", "/redoc", "/openapi.json"}


async def enforce_api_version(
    request: Request, call_next: RequestResponseEndpoint
) -> Response:
    path: str = request.url.path

    if path in _SKIP_PATHS or path.startswith(f"/{settings.api_version}/"):
        return await call_next(request)

    version: str | None = request.headers.get("x-api-version")
    if version and version != settings.api_version:
        detail = (
            f"Unsupported API version '{version}'. Expected '{settings.api_version}'."
        )
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": detail},
        )

    if version == settings.api_version:
        versioned_path = f"/{settings.api_version}{path}"
        request.scope["path"] = versioned_path
        request.scope["raw_path"] = versioned_path.encode()

    return await call_next(request)
