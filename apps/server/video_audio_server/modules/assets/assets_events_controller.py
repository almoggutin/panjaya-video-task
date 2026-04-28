from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from jwt import DecodeError, ExpiredSignatureError
from video_audio_server.core.models.error_models import UnauthorizedError
from video_audio_server.core.security import decode_access_token
from video_audio_server.core.services.sse_service import SseService
from video_audio_server.modules.auth.repositories.jti_repository import JtiRepository
from video_audio_server.shared.dependencies.repositories import get_jti_repository
from video_audio_server.shared.dependencies.services import get_sse_service

router = APIRouter(tags=["assets-events"])


@router.get("/events")
async def sse_events(
    access_token: str = Query(...),
    jti_repo: JtiRepository = Depends(get_jti_repository),
    sse: SseService = Depends(get_sse_service),
) -> StreamingResponse:
    try:
        claims = decode_access_token(access_token)
    except (DecodeError, ExpiredSignatureError):
        raise UnauthorizedError("Invalid or expired token") from None

    jti: str = str(claims.get("jti", ""))
    user_id: str = str(claims.get("sub", ""))

    if not jti or not await jti_repo.exists(jti):
        raise UnauthorizedError("Token has been revoked")

    return StreamingResponse(
        sse.subscribe(user_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
