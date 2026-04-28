from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from video_audio_server.core.models.error_models import ConflictError
from video_audio_server.modules.auth.dtos.signup_request_dto import SignupRequest
from video_audio_server.modules.auth.models.token_model import TokenPairModel
from video_audio_server.modules.auth.services.auth_service import AuthService
from video_audio_server.modules.auth.services.token_service import TokenService
from video_audio_server.modules.users.entities.user_entity import User
from video_audio_server.modules.users.repositories.user_repository import UserRepository


def _make_user(
    user_id: str = "user-1",
    email: str = "test@example.com",
    hashed_password: str = "hashed",
) -> MagicMock:
    user = MagicMock(spec=User)
    user.id = user_id
    user.email = email
    user.first_name = "Test"
    user.last_name = "User"
    user.hashed_password = hashed_password
    user.created_at = datetime.now(UTC)
    user.updated_at = datetime.now(UTC)
    return user


@pytest.mark.asyncio
async def test_signup_creates_user_and_returns_tokens() -> None:
    user_repo = AsyncMock(spec=UserRepository)
    token_service = AsyncMock(spec=TokenService)

    user = _make_user()
    user_repo.find_by_email.return_value = None
    user_repo.create.return_value = user
    token_service.issue_token_pair.return_value = TokenPairModel(
        access_token="access.tok.en",
        raw_refresh_token="tok-id:raw-tok",
    )

    request = SignupRequest(
        email="new@example.com", password="secret", first_name="New", last_name="User"
    )
    service = AuthService(user_repo, token_service)

    with patch(
        "video_audio_server.modules.auth.services.auth_service.hash_password",
        return_value="hashed",
    ):
        result = await service.signup(request)

    assert result.access_token == "access.tok.en"
    assert result.raw_refresh_token == "tok-id:raw-tok"
    user_repo.find_by_email.assert_awaited_once_with("new@example.com")
    user_repo.create.assert_awaited_once()
    token_service.issue_token_pair.assert_awaited_once_with(user.id)


@pytest.mark.asyncio
async def test_signup_raises_conflict_for_duplicate_email() -> None:
    user_repo = AsyncMock(spec=UserRepository)
    token_service = AsyncMock(spec=TokenService)
    user_repo.find_by_email.return_value = _make_user()

    request = SignupRequest(
        email="existing@example.com", password="pw", first_name="Dup", last_name="User"
    )
    service = AuthService(user_repo, token_service)

    with pytest.raises(ConflictError):
        await service.signup(request)
