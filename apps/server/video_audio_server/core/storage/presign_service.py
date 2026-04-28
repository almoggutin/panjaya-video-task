from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any

import aioboto3
from botocore.config import Config
from video_audio_server.core.config import settings

_S3_CONFIG = Config(signature_version="s3v4")


class PresignService:
    def __init__(self) -> None:
        self._session: aioboto3.Session = aioboto3.Session(
            aws_access_key_id=settings.s3_access_key_id,
            aws_secret_access_key=settings.s3_secret_access_key,
        )

    @asynccontextmanager
    async def _client(self) -> AsyncGenerator[Any, None]:
        s3: Any
        async with self._session.client(  # type: ignore[attr-defined]
            "s3", endpoint_url=settings.s3_endpoint_url, config=_S3_CONFIG
        ) as s3:
            yield s3

    async def generate_presigned_put(self, key: str, ttl: int) -> str:
        params: dict[str, Any] = {"Bucket": settings.s3_bucket, "Key": key}
        async with self._client() as s3:
            return await s3.generate_presigned_url(
                "put_object", Params=params, ExpiresIn=ttl
            )

    async def generate_presigned_get(self, key: str, ttl: int) -> str:
        params: dict[str, Any] = {"Bucket": settings.s3_bucket, "Key": key}
        async with self._client() as s3:
            return await s3.generate_presigned_url(
                "get_object", Params=params, ExpiresIn=ttl
            )
