from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class ChangePasswordRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    current_password: str
    new_password: str
