import pytest
from httpx import AsyncClient

_SIGNUP_PAYLOAD = {
    "email": "cycle@example.com",
    "password": "Secret123!",
    "first_name": "Cycle",
    "last_name": "User",
}


@pytest.mark.asyncio
async def test_signup_returns_tokens(client: AsyncClient) -> None:
    resp = await client.post("/auth/signup", json=_SIGNUP_PAYLOAD)

    assert resp.status_code == 201
    data = resp.json()
    assert data["accessToken"]
    assert data["refreshToken"]
    assert data["expiresIn"] > 0


@pytest.mark.asyncio
async def test_signup_duplicate_email_returns_conflict(client: AsyncClient) -> None:
    await client.post("/auth/signup", json=_SIGNUP_PAYLOAD)
    resp = await client.post("/auth/signup", json=_SIGNUP_PAYLOAD)

    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_login_returns_tokens(client: AsyncClient) -> None:
    await client.post("/auth/signup", json=_SIGNUP_PAYLOAD)
    resp = await client.post(
        "/auth/login",
        json={
            "email": _SIGNUP_PAYLOAD["email"],
            "password": _SIGNUP_PAYLOAD["password"],
        },
    )

    assert resp.status_code == 200
    assert resp.json()["accessToken"]


@pytest.mark.asyncio
async def test_login_wrong_password_returns_unauthorized(client: AsyncClient) -> None:
    await client.post("/auth/signup", json=_SIGNUP_PAYLOAD)
    resp = await client.post(
        "/auth/login",
        json={
            "email": _SIGNUP_PAYLOAD["email"],
            "password": "wrong",
        },
    )

    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_refresh_issues_new_token_pair(client: AsyncClient) -> None:
    resp = await client.post("/auth/signup", json=_SIGNUP_PAYLOAD)
    refresh_token = resp.json()["refreshToken"]

    resp = await client.post("/auth/refresh", json={"refresh_token": refresh_token})

    assert resp.status_code == 200
    data = resp.json()
    assert data["accessToken"]
    assert data["refreshToken"] != refresh_token


@pytest.mark.asyncio
async def test_full_auth_cycle(client: AsyncClient) -> None:
    # Signup
    resp = await client.post("/auth/signup", json=_SIGNUP_PAYLOAD)
    assert resp.status_code == 201
    refresh_token = resp.json()["refreshToken"]

    # Refresh
    resp = await client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    new_access_token = resp.json()["accessToken"]
    new_refresh_token = resp.json()["refreshToken"]

    # Logout
    resp = await client.post(
        "/auth/logout",
        json={"refresh_token": new_refresh_token},
        headers={"Authorization": f"Bearer {new_access_token}"},
    )
    assert resp.status_code == 204

    # Old refresh token is consumed — rotate should fail
    resp = await client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 401

    # New refresh token is revoked — rotate should also fail
    resp = await client.post("/auth/refresh", json={"refresh_token": new_refresh_token})
    assert resp.status_code == 401
