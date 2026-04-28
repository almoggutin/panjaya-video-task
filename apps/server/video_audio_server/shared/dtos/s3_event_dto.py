from pydantic import BaseModel, ConfigDict, Field


class S3Object(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    key: str
    user_metadata: dict[str, str] | None = Field(default=None, alias="userMetadata")


class S3Bucket(BaseModel):
    name: str


class S3Info(BaseModel):
    bucket: S3Bucket
    object: S3Object


class S3EventRecord(BaseModel):
    s3: S3Info


class S3Event(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    records: list[S3EventRecord] = Field(alias="Records")
