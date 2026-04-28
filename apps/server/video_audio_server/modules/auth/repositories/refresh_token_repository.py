from datetime import datetime

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from video_audio_server.modules.auth.entities.refresh_token_entity import RefreshToken


class RefreshTokenRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def find_by_id(self, token_id: str) -> RefreshToken | None:
        return await self._db.get(RefreshToken, token_id)

    async def create(
        self,
        user_id: str,
        token_hash: str,
        family_id: str,
        expires_at: datetime,
    ) -> RefreshToken:
        row = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            family_id=family_id,
            expires_at=expires_at,
        )
        self._db.add(row)
        await self._db.flush()
        return row

    async def revoke(self, row: RefreshToken) -> None:
        row.revoked = True

    async def revoke_family(self, family_id: str) -> None:
        await self._db.execute(
            update(RefreshToken)
            .where(RefreshToken.family_id == family_id)
            .values(revoked=True)
        )

    async def refresh_row(self, row: RefreshToken) -> None:
        await self._db.refresh(row)

    async def commit(self) -> None:
        await self._db.commit()
