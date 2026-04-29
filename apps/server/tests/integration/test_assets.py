from typing import Any

import pytest
from httpx import AsyncClient
from video_audio_server.core.config import settings
from video_audio_server.modules.assets.models.processing_status_model import (
    ProcessingStatus,
)


@pytest.mark.asyncio
async def test_create_asset_returns_presigned_url(
    client: AsyncClient,
    auth_headers: dict[str, str],
) -> None:
    resp = await client.post(
        "/assets",
        json={
            "title": "My Video",
            "filename": "clip.mp4",
            "sizeBytes": 2_097_152,
            "mimeType": "video/mp4",
        },
        headers=auth_headers,
    )

    assert resp.status_code == 201
    data = resp.json()
    assert data["assetId"]
    assert data["uploadUrl"]


@pytest.mark.asyncio
async def test_create_asset_unsupported_mime_returns_422(
    client: AsyncClient,
    auth_headers: dict[str, str],
) -> None:
    resp = await client.post(
        "/assets",
        json={
            "title": "Bad File",
            "filename": "image.png",
            "sizeBytes": 1024,
            "mimeType": "image/png",
        },
        headers=auth_headers,
    )

    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_asset_exceeds_size_returns_422(
    client: AsyncClient,
    auth_headers: dict[str, str],
) -> None:
    resp = await client.post(
        "/assets",
        json={
            "title": "Huge",
            "filename": "huge.mp4",
            "sizeBytes": settings.max_upload_bytes + 1,
            "mimeType": "video/mp4",
        },
        headers=auth_headers,
    )

    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_list_assets_returns_paginated_response(
    client: AsyncClient,
    auth_headers: dict[str, str],
    test_asset: dict[str, Any],
) -> None:
    user_id: str = (await client.get("/users/me", headers=auth_headers)).json()["id"]
    asset_id = test_asset["assetId"]
    s3_event: dict[str, Any] = {
        "Records": [
            {
                "s3": {
                    "bucket": {"name": settings.s3_bucket},
                    "object": {"key": f"{user_id}/{asset_id}/video.mp4"},
                }
            }
        ]
    }
    await client.post(
        "/assets/webhooks/s3-event",
        json=s3_event,
        headers={"Authorization": settings.worker_job_secret},
    )

    resp = await client.get("/assets", headers=auth_headers)

    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["id"] == asset_id


@pytest.mark.asyncio
async def test_get_asset_returns_pending_upload_status(
    client: AsyncClient,
    auth_headers: dict[str, str],
    test_asset: dict[str, Any],
) -> None:
    asset_id = test_asset["assetId"]
    resp = await client.get(f"/assets/{asset_id}", headers=auth_headers)

    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == asset_id
    assert data["status"] == ProcessingStatus.PENDING_UPLOAD


@pytest.mark.asyncio
async def test_get_asset_not_found(
    client: AsyncClient,
    auth_headers: dict[str, str],
) -> None:
    resp = await client.get("/assets/nonexistent-id", headers=auth_headers)

    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_s3_webhook_transitions_asset_to_queued(
    client: AsyncClient,
    auth_headers: dict[str, str],
    test_asset: dict[str, Any],
) -> None:
    user_id: str = (await client.get("/users/me", headers=auth_headers)).json()["id"]
    asset_id: str = test_asset["assetId"]
    s3_event: dict[str, Any] = {
        "Records": [
            {
                "s3": {
                    "bucket": {"name": settings.s3_bucket},
                    "object": {"key": f"{user_id}/{asset_id}/video.mp4"},
                },
            }
        ]
    }
    resp = await client.post(
        "/assets/webhooks/s3-event",
        json=s3_event,
        headers={"Authorization": settings.worker_job_secret},
    )
    assert resp.status_code == 204

    resp = await client.get(f"/assets/{asset_id}", headers=auth_headers)
    assert resp.json()["status"] == ProcessingStatus.QUEUED


@pytest.mark.asyncio
async def test_delete_asset_removes_it(
    client: AsyncClient,
    auth_headers: dict[str, str],
    test_asset: dict[str, Any],
) -> None:
    asset_id = test_asset["assetId"]

    resp = await client.delete(f"/assets/{asset_id}", headers=auth_headers)
    assert resp.status_code == 204

    resp = await client.get(f"/assets/{asset_id}", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_unauthenticated_request_returns_401(client: AsyncClient) -> None:
    resp = await client.get("/assets")

    assert resp.status_code == 401
