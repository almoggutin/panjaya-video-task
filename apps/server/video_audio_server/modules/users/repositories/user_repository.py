from sqlalchemy import select
from video_audio_server.modules.users.dtos.update_profile_dto import (
    UpdateProfileRequest,
)
from video_audio_server.modules.users.dtos.user_create_dto import UserCreateData
from video_audio_server.modules.users.entities.user_entity import User
from video_audio_server.shared.repositories.crud_repository import CrudRepository


class UserRepository(
    CrudRepository[User, UserCreateData, UpdateProfileRequest, UpdateProfileRequest]
):
    _entity_class = User

    async def find_by_email(self, email: str) -> User | None:
        return await self._db.scalar(select(User).where(User.email == email))
