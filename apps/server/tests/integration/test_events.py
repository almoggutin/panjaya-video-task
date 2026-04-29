from collections.abc import AsyncGenerator

import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from video_audio_server.core.services.sse_service import SseService
from video_audio_server.shared.dependencies.services import get_sse_service


class _MockSseService(SseService):
    def __init__(self) -> None:
        pass

    async def subscribe(self, user_id: str) -> AsyncGenerator[str, None]:
        yield "event: ping\ndata: {}\n\n"


@pytest.fixture(autouse=True)
def _mock_sse(app: FastAPI) -> None:
    app.dependency_overrides[get_sse_service] = lambda: _MockSseService()
    yield
    del app.dependency_overrides[get_sse_service]


@pytest.mark.asyncio
async def test_sse_rejects_missing_token(client: AsyncClient) -> None:
    async with client.stream("GET", "/assets/events") as resp:
        assert resp.status_code == 422  # missing required query param


@pytest.mark.asyncio
async def test_sse_rejects_invalid_token(client: AsyncClient) -> None:
    async with client.stream(
        "GET", "/assets/events?access_token=not-a-valid-jwt"
    ) as resp:
        assert resp.status_code == 401


@pytest.mark.asyncio
async def test_sse_accepts_valid_token_and_streams(
    client: AsyncClient,
    auth_headers: dict[str, str],
) -> None:
    token = auth_headers["Authorization"].removeprefix("Bearer ")

    async with client.stream("GET", f"/assets/events?access_token={token}") as resp:
        assert resp.status_code == 200
        assert resp.headers["content-type"].startswith("text/event-stream")
