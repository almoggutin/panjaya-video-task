from pydantic import BaseModel, ConfigDict, EmailStr
from pydantic.alias_generators import to_camel


class LoginRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    email: EmailStr
    password: str
