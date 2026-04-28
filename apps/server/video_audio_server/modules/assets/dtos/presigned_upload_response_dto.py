from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class PresignedUploadResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    asset_id: str
    upload_url: str
