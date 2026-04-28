from pydantic import BaseModel, ConfigDict, EmailStr
from pydantic.alias_generators import to_camel


class UpdateProfileRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    email: EmailStr | None = None
    first_name: str | None = None
    last_name: str | None = None
