from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from video_audio_server.modules.auth.entities.refresh_token_entity import RefreshToken
from video_audio_server.modules.auth.repositories.jti_repository import JtiRepository
from video_audio_server.modules.auth.repositories.refresh_token_repository import (
    RefreshTokenRepository,
)
from video_audio_server.modules.auth.services.token_service import TokenService


def _make_refresh_token(
    token_id: str = "tok-1",
    user_id: str = "user-1",
    token_hash: str = "hash",
    family_id: str = "fam-1",
    revoked: bool = False,
    expires_at: datetime | None = None,
) -> MagicMock:
    tok = MagicMock(spec=RefreshToken)
    tok.id = token_id
    tok.user_id = user_id
    tok.token_hash = token_hash
    tok.family_id = family_id
    tok.revoked = revoked
    tok.expires_at = expires_at or datetime.now(UTC) + timedelta(days=7)
    tok.created_at = datetime.now(UTC)
    return tok


@pytest.mark.asyncio
async def test_logout_revokes_token_and_deletes_jti() -> None:
    token_repo = AsyncMock(spec=RefreshTokenRepository)
    jti_repo = AsyncMock(spec=JtiRepository)
    row = _make_refresh_token()
    token_repo.find_by_id.return_value = row

    service = TokenService(token_repo, jti_repo)

    with patch(
        "video_audio_server.modules.auth.services.token_service.verify_password",
        return_value=True,
    ):
        await service.revoke("tok-1", "raw-tok", "jti-abc")

    token_repo.revoke.assert_awaited_once_with(row)
    token_repo.commit.assert_awaited_once()
    jti_repo.delete.assert_awaited_once_with("jti-abc")


@pytest.mark.asyncio
async def test_logout_is_idempotent_for_already_revoked_token() -> None:
    token_repo = AsyncMock(spec=RefreshTokenRepository)
    jti_repo = AsyncMock(spec=JtiRepository)
    token_repo.find_by_id.return_value = _make_refresh_token(revoked=True)

    service = TokenService(token_repo, jti_repo)
    await service.revoke("tok-1", "raw-tok", "jti-abc")

    token_repo.revoke.assert_not_awaited()
    token_repo.commit.assert_not_awaited()
    jti_repo.delete.assert_not_awaited()
