from video_audio_server.core.models.error_models import (
    ConflictError,
    NotFoundError,
    UnauthorizedError,
)
from video_audio_server.core.security import hash_password, verify_password
from video_audio_server.modules.users.dtos.change_password_dto import (
    ChangePasswordRequest,
)
from video_audio_server.modules.users.dtos.update_profile_dto import (
    UpdateProfileRequest,
)
from video_audio_server.modules.users.entities.user_entity import User
from video_audio_server.modules.users.repositories.user_repository import UserRepository


class UsersService:
    def __init__(self, user_repo: UserRepository) -> None:
        self._user_repo = user_repo

    async def get(self, user_id: str) -> User:
        user = await self._user_repo.find_by_id(user_id)
        if user is None:
            raise NotFoundError("User not found")
        return user

    async def update(self, user_id: str, request: UpdateProfileRequest) -> User:
        user = await self.get(user_id)

        if request.email is not None and request.email != user.email:
            existing = await self._user_repo.find_by_email(str(request.email))
            if existing is not None:
                raise ConflictError("Email already in use")

        await self._user_repo.patch(user, request)
        await self._user_repo.commit()

        return user

    async def change_password(
        self, user_id: str, request: ChangePasswordRequest
    ) -> None:
        user = await self.get(user_id)

        if not verify_password(request.current_password, user.hashed_password):
            raise UnauthorizedError("Current password is incorrect")

        user.hashed_password = hash_password(request.new_password)
        await self._user_repo.commit()

    async def delete(self, user_id: str) -> None:
        user = await self.get(user_id)

        await self._user_repo.delete(user)
        await self._user_repo.commit()
