from unittest.mock import AsyncMock, MagicMock

import pytest
from video_audio_server.core.models.error_models import NotFoundError
from video_audio_server.modules.users.entities.user_entity import User
from video_audio_server.modules.users.repositories.user_repository import UserRepository
from video_audio_server.modules.users.services.users_service import UsersService


def _make_user(
    user_id: str = "user-1",
    email: str = "test@example.com",
    first_name: str = "Test",
    last_name: str = "User",
) -> MagicMock:
    user = MagicMock(spec=User)
    user.id = user_id
    user.email = email
    user.first_name = first_name
    user.last_name = last_name
    user.hashed_password = "hashed"
    return user


def _make_service() -> tuple[UsersService, AsyncMock]:
    repo = AsyncMock(spec=UserRepository)
    return UsersService(repo), repo


@pytest.mark.asyncio
async def test_get_me_returns_user() -> None:
    service, repo = _make_service()
    repo.find_by_id.return_value = _make_user()

    user = await service.get("user-1")

    assert user.id == "user-1"
    repo.find_by_id.assert_awaited_once_with("user-1")


@pytest.mark.asyncio
async def test_get_me_raises_not_found() -> None:
    service, repo = _make_service()
    repo.find_by_id.return_value = None

    with pytest.raises(NotFoundError):
        await service.get("ghost")
