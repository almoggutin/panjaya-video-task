from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CreateAssetRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    title: str
    description: str | None = None
    filename: str
    size_bytes: int
    mime_type: str
