from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class TokenPairResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str = "bearer"
