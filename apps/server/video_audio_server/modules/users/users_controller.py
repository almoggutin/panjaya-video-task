from fastapi import APIRouter, Depends, status
from video_audio_server.modules.users.dtos.change_password_dto import (
    ChangePasswordRequest,
)
from video_audio_server.modules.users.dtos.update_profile_dto import (
    UpdateProfileRequest,
)
from video_audio_server.modules.users.dtos.user_response_dto import UserResponse
from video_audio_server.modules.users.entities.user_entity import User
from video_audio_server.modules.users.services.users_service import UsersService
from video_audio_server.shared.dependencies.auth import get_current_user
from video_audio_server.shared.dependencies.services import get_users_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    return UserResponse.from_entity(current_user)


@router.patch("/me")
async def update_me(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    users_service: UsersService = Depends(get_users_service),
) -> UserResponse:
    user: User = await users_service.update(current_user.id, request)
    return UserResponse.from_entity(user)


@router.patch("/me/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    users_service: UsersService = Depends(get_users_service),
) -> None:
    await users_service.change_password(current_user.id, request)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_me(
    current_user: User = Depends(get_current_user),
    users_service: UsersService = Depends(get_users_service),
) -> None:
    await users_service.delete(current_user.id)
