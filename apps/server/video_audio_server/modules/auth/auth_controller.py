from fastapi import APIRouter, Depends, Header, status
from video_audio_server.core.config import settings
from video_audio_server.core.decorators.skip_idempotency import skip_idempotency
from video_audio_server.core.models.error_models import UnauthorizedError
from video_audio_server.core.security import decode_access_token
from video_audio_server.modules.auth.dtos.login_request_dto import LoginRequest
from video_audio_server.modules.auth.dtos.logout_request_dto import LogoutRequest
from video_audio_server.modules.auth.dtos.signup_request_dto import SignupRequest
from video_audio_server.modules.auth.dtos.token_request_dto import RefreshRequest
from video_audio_server.modules.auth.dtos.token_response_dto import TokenPairResponse
from video_audio_server.modules.auth.services.auth_service import AuthService
from video_audio_server.modules.auth.services.token_service import TokenService
from video_audio_server.shared.dependencies.services import (
    get_auth_service,
    get_token_service,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", status_code=status.HTTP_201_CREATED)
@skip_idempotency
async def signup(
    request: SignupRequest,
    service: AuthService = Depends(get_auth_service),
) -> TokenPairResponse:
    tokens = await service.signup(request)
    return TokenPairResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.raw_refresh_token,
        expires_in=settings.jwt_access_ttl_seconds,
    )


@router.post("/login")
@skip_idempotency
async def login(
    request: LoginRequest,
    service: AuthService = Depends(get_auth_service),
) -> TokenPairResponse:
    tokens = await service.login(request)
    return TokenPairResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.raw_refresh_token,
        expires_in=settings.jwt_access_ttl_seconds,
    )


@router.post("/refresh")
@skip_idempotency
async def refresh(
    body: RefreshRequest,
    token_service: TokenService = Depends(get_token_service),
) -> TokenPairResponse:
    if ":" not in body.refresh_token:
        raise UnauthorizedError("Invalid refresh token")

    token_id, raw_token = body.refresh_token.split(":", 1)
    tokens = await token_service.rotate(token_id, raw_token)
    return TokenPairResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.raw_refresh_token,
        expires_in=settings.jwt_access_ttl_seconds,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
@skip_idempotency
async def logout(
    body: LogoutRequest,
    authorization: str | None = Header(default=None),
    token_service: TokenService = Depends(get_token_service),
) -> None:
    if ":" not in body.refresh_token:
        return

    token_id, raw_token = body.refresh_token.split(":", 1)

    jti = ""
    if authorization and authorization.startswith("Bearer "):
        try:
            claims = decode_access_token(authorization.removeprefix("Bearer "))
            jti = str(claims.get("jti", ""))
        except Exception:
            pass

    await token_service.revoke(token_id, raw_token, jti)
