"""Shared fixtures for all test suites."""

import subprocess
from collections.abc import AsyncGenerator
from typing import Any

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool
from video_audio_server.core.config import settings
from video_audio_server.main import create_app
from video_audio_server.shared.dependencies.db import get_db


@pytest.fixture(scope="session", autouse=True)
def _run_migrations() -> None:
    subprocess.run([".venv/bin/alembic", "upgrade", "head"], check=True)


@pytest.fixture(scope="session")
def app() -> FastAPI:
    application = create_app()

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        engine = create_async_engine(settings.database_url, poolclass=NullPool)
        factory = async_sessionmaker(engine, expire_on_commit=False)
        async with factory() as session:
            yield session
        await engine.dispose()

    application.dependency_overrides[get_db] = override_get_db
    return application


@pytest.fixture(autouse=True)
async def _clean_db() -> AsyncGenerator[None, None]:
    engine = create_async_engine(settings.database_url, poolclass=NullPool)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as session:
        await session.execute(text("TRUNCATE users CASCADE"))
        await session.commit()
    await engine.dispose()
    yield


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    engine = create_async_engine(settings.database_url, poolclass=NullPool)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as session:
        yield session
    await engine.dispose()


@pytest.fixture
async def client(app: FastAPI) -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        yield c


@pytest.fixture
async def auth_headers(client: AsyncClient) -> dict[str, str]:
    resp = await client.post(
        "/auth/signup",
        json={
            "email": "testuser@example.com",
            "password": "Secret123!",
            "firstName": "Test",
            "lastName": "User",
        },
    )
    assert resp.status_code == 201
    return {"Authorization": f"Bearer {resp.json()['accessToken']}"}


@pytest.fixture
async def test_asset(
    client: AsyncClient, auth_headers: dict[str, str]
) -> dict[str, Any]:
    resp = await client.post(
        "/assets",
        json={
            "title": "Test Video",
            "filename": "test.mp4",
            "sizeBytes": 1_048_576,
            "mimeType": "video/mp4",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    return resp.json()
