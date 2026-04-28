from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import DecodeError, ExpiredSignatureError
from sqlalchemy.ext.asyncio import AsyncSession
from video_audio_server.core.models.error_models import UnauthorizedError
from video_audio_server.core.security import decode_access_token
from video_audio_server.modules.auth.repositories.jti_repository import JtiRepository
from video_audio_server.modules.users.entities.user_entity import User
from video_audio_server.shared.dependencies.db import get_db
from video_audio_server.shared.dependencies.repositories import get_jti_repository

_bearer = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
    jti_repo: JtiRepository = Depends(get_jti_repository),
) -> User:
    try:
        claims = decode_access_token(credentials.credentials)
    except (DecodeError, ExpiredSignatureError) as err:
        raise UnauthorizedError("Invalid or expired token") from err

    jti: str = str(claims.get("jti", ""))
    user_id: str = str(claims.get("sub", ""))

    if not jti or not await jti_repo.exists(jti):
        raise UnauthorizedError("Token has been revoked")

    user = await db.get(User, user_id)
    if user is None:
        raise UnauthorizedError("User not found")

    return user
