import pytest
from httpx import AsyncClient


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
