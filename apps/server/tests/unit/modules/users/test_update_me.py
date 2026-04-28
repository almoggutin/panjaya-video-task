from unittest.mock import AsyncMock, MagicMock

import pytest
from video_audio_server.core.models.error_models import ConflictError, NotFoundError
from video_audio_server.modules.users.dtos.update_profile_dto import (
    UpdateProfileRequest,
)
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
async def test_update_me_updates_name_fields() -> None:
    service, repo = _make_service()
    user = _make_user()
    repo.find_by_id.return_value = user

    request = UpdateProfileRequest(first_name="Jane", last_name="Doe")
    result = await service.update("user-1", request)

    assert result.first_name == "Jane"
    assert result.last_name == "Doe"
    repo.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_update_me_changes_email_when_not_taken() -> None:
    service, repo = _make_service()
    user = _make_user(email="old@example.com")
    repo.find_by_id.return_value = user
    repo.find_by_email.return_value = None

    request = UpdateProfileRequest(email="new@example.com")
    await service.update("user-1", request)

    assert user.email == "new@example.com"
    repo.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_update_me_raises_conflict_for_taken_email() -> None:
    service, repo = _make_service()
    user = _make_user(email="old@example.com")
    repo.find_by_id.return_value = user
    repo.find_by_email.return_value = _make_user(email="new@example.com")

    request = UpdateProfileRequest(email="new@example.com")
    with pytest.raises(ConflictError):
        await service.update("user-1", request)


@pytest.mark.asyncio
async def test_update_me_raises_not_found() -> None:
    service, repo = _make_service()
    repo.find_by_id.return_value = None

    with pytest.raises(NotFoundError):
        await service.update("ghost", UpdateProfileRequest())
