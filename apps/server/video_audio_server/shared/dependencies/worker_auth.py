from fastapi import Header
from video_audio_server.core.config import settings
from video_audio_server.core.models.error_models import UnauthorizedError


async def verify_worker_secret(
    authorization: str | None = Header(default=None),
) -> None:
    token = (authorization or "").removeprefix("Bearer ").strip()
    if token != settings.worker_job_secret:
        raise UnauthorizedError("Forbidden")
