from pydantic import BaseModel, ConfigDict, EmailStr
from pydantic.alias_generators import to_camel


class SignupRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    email: EmailStr
    password: str
    first_name: str
    last_name: str
