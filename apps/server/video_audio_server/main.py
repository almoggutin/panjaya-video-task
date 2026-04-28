from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from video_audio_server.app_router import router as app_router
from video_audio_server.core.config import settings
from video_audio_server.core.middlewares.api_version_middleware import (
    enforce_api_version,
)
from video_audio_server.core.middlewares.idempotency_middleware import (
    idempotency_middleware,
)
from video_audio_server.core.middlewares.request_size_middleware import (
    limit_request_size,
)
from video_audio_server.core.middlewares.server_header_middleware import (
    strip_server_header,
)
from video_audio_server.core.models.error_models import (
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
    UnprocessableError,
    conflict_handler,
    forbidden_handler,
    not_found_handler,
    unauthorized_handler,
    unprocessable_handler,
)
from video_audio_server.modules.assets.assets_controller import router as assets_router
from video_audio_server.modules.auth.auth_controller import router as auth_router
from video_audio_server.modules.users.users_controller import router as users_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="Panjaya Video API",
        description="Video upload and audio transformation service",
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_whitelist,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.middleware("http")(strip_server_header)
    app.middleware("http")(limit_request_size)
    app.middleware("http")(enforce_api_version)
    app.middleware("http")(idempotency_middleware)

    app.add_exception_handler(NotFoundError, not_found_handler)
    app.add_exception_handler(ForbiddenError, forbidden_handler)
    app.add_exception_handler(ConflictError, conflict_handler)
    app.add_exception_handler(UnauthorizedError, unauthorized_handler)
    app.add_exception_handler(UnprocessableError, unprocessable_handler)

    app.include_router(app_router)
    app.include_router(auth_router)
    app.include_router(users_router)
    app.include_router(assets_router)

    return app


app = create_app()
