from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from video_audio_server.core.models.error_models import UnauthorizedError
from video_audio_server.modules.auth.dtos.login_request_dto import LoginRequest
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
async def test_login_returns_tokens_for_valid_credentials() -> None:
    user_repo = AsyncMock(spec=UserRepository)
    token_service = AsyncMock(spec=TokenService)

    user = _make_user()
    user_repo.find_by_email.return_value = user
    token_service.issue_token_pair.return_value = TokenPairModel(
        access_token="access.tok.en",
        raw_refresh_token="tok-id:raw-tok",
    )

    request = LoginRequest(email="test@example.com", password="secret")
    service = AuthService(user_repo, token_service)

    with patch(
        "video_audio_server.modules.auth.services.auth_service.verify_password",
        return_value=True,
    ):
        result = await service.login(request)

    assert result.access_token == "access.tok.en"
    token_service.issue_token_pair.assert_awaited_once_with(user.id)


@pytest.mark.asyncio
async def test_login_raises_unauthorized_for_wrong_password() -> None:
    user_repo = AsyncMock(spec=UserRepository)
    token_service = AsyncMock(spec=TokenService)
    user_repo.find_by_email.return_value = _make_user()

    request = LoginRequest(email="test@example.com", password="wrong")
    service = AuthService(user_repo, token_service)

    with (
        patch(
            "video_audio_server.modules.auth.services.auth_service.verify_password",
            return_value=False,
        ),
        pytest.raises(UnauthorizedError),
    ):
        await service.login(request)


@pytest.mark.asyncio
async def test_login_raises_unauthorized_for_unknown_email() -> None:
    user_repo = AsyncMock(spec=UserRepository)
    token_service = AsyncMock(spec=TokenService)
    user_repo.find_by_email.return_value = None

    request = LoginRequest(email="ghost@example.com", password="pw")
    service = AuthService(user_repo, token_service)

    with pytest.raises(UnauthorizedError):
        await service.login(request)
