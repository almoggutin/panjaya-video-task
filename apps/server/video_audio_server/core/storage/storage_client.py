from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import aioboto3
from video_audio_server.core.config import settings


class StorageClient:
    def __init__(self) -> None:
        self._session: aioboto3.Session = aioboto3.Session(
            aws_access_key_id=settings.s3_access_key_id,
            aws_secret_access_key=settings.s3_secret_access_key,
        )

    @asynccontextmanager
    async def _client(self) -> AsyncGenerator[Any, None]:
        s3: Any
        async with self._session.client(  # type: ignore[attr-defined]
            "s3", endpoint_url=settings.s3_endpoint_url
        ) as s3:
            yield s3

    async def upload_file(
        self,
        key: str,
        file_path: Path | str,
        content_type: str | None = None,
        metadata: dict[str, str] | None = None,
    ) -> None:
        extra: dict[str, Any] = {}
        if content_type:
            extra["ContentType"] = content_type
        if metadata:
            extra["Metadata"] = metadata

        async with self._client() as s3:
            await s3.upload_file(
                str(file_path),
                settings.s3_bucket,
                key,
                ExtraArgs=extra or None,
            )

    async def delete_object(self, key: str) -> None:
        async with self._client() as s3:
            await s3.delete_object(Bucket=settings.s3_bucket, Key=key)

    async def download_file(self, key: str, dest_path: Path | str) -> None:
        async with self._client() as s3:
            await s3.download_file(settings.s3_bucket, key, str(dest_path))

    async def head_object(self, key: str) -> dict[str, Any]:
        async with self._client() as s3:
            return await s3.head_object(Bucket=settings.s3_bucket, Key=key)
