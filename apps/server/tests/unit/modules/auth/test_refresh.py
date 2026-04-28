from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from video_audio_server.core.models.error_models import UnauthorizedError
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
async def test_refresh_rotates_token_and_returns_new_pair() -> None:
    token_repo = AsyncMock(spec=RefreshTokenRepository)
    jti_repo = AsyncMock(spec=JtiRepository)

    stored_row = _make_refresh_token(token_id="tok-1", revoked=False)
    new_row = _make_refresh_token(token_id="tok-2", revoked=False)
    token_repo.find_by_id.return_value = stored_row
    token_repo.create.return_value = new_row

    service = TokenService(token_repo, jti_repo)

    with (
        patch(
            "video_audio_server.modules.auth.services.token_service.verify_password",
            return_value=True,
        ),
        patch(
            "video_audio_server.modules.auth.services.token_service.create_access_token",
            return_value="new.access.tok",
        ),
        patch(
            "video_audio_server.modules.auth.services.token_service.decode_access_token",
            return_value={"jti": "new-jti", "sub": "user-1"},
        ),
        patch(
            "video_audio_server.modules.auth.services.token_service.hash_password",
            return_value="new-hash",
        ),
    ):
        result = await service.rotate("tok-1", "raw-tok")

    assert result.access_token == "new.access.tok"
    assert result.raw_refresh_token.startswith("tok-2:")
    token_repo.revoke.assert_awaited_once_with(stored_row)
    jti_repo.store.assert_awaited_once_with("new-jti")


@pytest.mark.asyncio
async def test_refresh_raises_unauthorized_for_missing_token() -> None:
    token_repo = AsyncMock(spec=RefreshTokenRepository)
    jti_repo = AsyncMock(spec=JtiRepository)
    token_repo.find_by_id.return_value = None

    service = TokenService(token_repo, jti_repo)

    with pytest.raises(UnauthorizedError):
        await service.rotate("bad-id", "raw")


@pytest.mark.asyncio
async def test_refresh_revokes_family_on_token_reuse() -> None:
    token_repo = AsyncMock(spec=RefreshTokenRepository)
    jti_repo = AsyncMock(spec=JtiRepository)
    revoked_row = _make_refresh_token(revoked=True)
    token_repo.find_by_id.return_value = revoked_row

    service = TokenService(token_repo, jti_repo)

    with pytest.raises(UnauthorizedError):
        await service.rotate("tok-1", "raw")

    token_repo.revoke_family.assert_awaited_once_with(revoked_row.family_id)
    token_repo.commit.assert_awaited_once()
