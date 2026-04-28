from __future__ import annotations

from typing import TYPE_CHECKING

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

if TYPE_CHECKING:
    from video_audio_server.modules.users.entities.user_entity import User


class UserResponse(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

    id: str
    email: str
    first_name: str
    last_name: str
    full_name: str

    @classmethod
    def from_entity(cls, user: User) -> UserResponse:
        return cls.model_validate(user)

    @classmethod
    def from_many(cls, users: list[User]) -> list[UserResponse]:
        return [cls.model_validate(u) for u in users]
