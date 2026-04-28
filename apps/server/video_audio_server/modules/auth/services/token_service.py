import uuid
from datetime import UTC, datetime, timedelta

from video_audio_server.core.config import settings
from video_audio_server.core.models.error_models import UnauthorizedError
from video_audio_server.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from video_audio_server.modules.auth.models.token_model import TokenPairModel
from video_audio_server.modules.auth.repositories.jti_repository import JtiRepository
from video_audio_server.modules.auth.repositories.refresh_token_repository import (
    RefreshTokenRepository,
)


class TokenService:
    def __init__(
        self,
        token_repo: RefreshTokenRepository,
        jti_repo: JtiRepository,
    ) -> None:
        self._token_repo = token_repo
        self._jti_repo = jti_repo

    async def issue_token_pair(self, user_id: str) -> TokenPairModel:
        access_token: str = create_access_token(user_id)
        claims = decode_access_token(access_token)
        jti: str = str(claims["jti"])
        await self._jti_repo.store(jti)

        raw_refresh_token: str = str(uuid.uuid4())
        family_id: str = str(uuid.uuid4())
        row = await self._token_repo.create(
            user_id=user_id,
            token_hash=hash_password(raw_refresh_token),
            family_id=family_id,
            expires_at=datetime.now(UTC)
            + timedelta(seconds=settings.jwt_refresh_ttl_seconds),
        )
        await self._token_repo.commit()

        return TokenPairModel(
            access_token=access_token,
            raw_refresh_token=f"{row.id}:{raw_refresh_token}",
        )

    async def rotate(self, token_id: str, raw_token: str) -> TokenPairModel:
        row = await self._token_repo.find_by_id(token_id)

        if row is None or datetime.now(UTC) > row.expires_at.replace(tzinfo=UTC):
            raise UnauthorizedError("Invalid refresh token")

        if row.revoked:
            await self._token_repo.revoke_family(row.family_id)
            await self._token_repo.commit()
            raise UnauthorizedError("Refresh token reuse detected")

        if not verify_password(raw_token, row.token_hash):
            raise UnauthorizedError("Invalid refresh token")

        await self._token_repo.revoke(row)

        new_access_token: str = create_access_token(row.user_id)
        claims = decode_access_token(new_access_token)
        new_jti: str = str(claims["jti"])
        await self._jti_repo.store(new_jti)

        raw_refresh_token: str = str(uuid.uuid4())
        new_row = await self._token_repo.create(
            user_id=row.user_id,
            token_hash=hash_password(raw_refresh_token),
            family_id=row.family_id,
            expires_at=datetime.now(UTC)
            + timedelta(seconds=settings.jwt_refresh_ttl_seconds),
        )
        await self._token_repo.commit()
        await self._token_repo.refresh_row(new_row)

        return TokenPairModel(
            access_token=new_access_token,
            raw_refresh_token=f"{new_row.id}:{raw_refresh_token}",
        )

    async def revoke(self, token_id: str, raw_token: str, jti: str) -> None:
        row = await self._token_repo.find_by_id(token_id)
        if row is None or row.revoked:
            return

        if verify_password(raw_token, row.token_hash):
            await self._token_repo.revoke(row)
            await self._token_repo.commit()

        await self._jti_repo.delete(jti)
