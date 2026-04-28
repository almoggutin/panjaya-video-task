import base64
import hashlib
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
import jwt as pyjwt
from video_audio_server.core.config import settings


def _prehash(value: str) -> bytes:
    digest = hashlib.sha256(value.encode()).digest()
    return base64.b64encode(digest)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_prehash(password), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(_prehash(plain), hashed.encode())


def create_access_token(user_id: str) -> str:
    payload: dict[str, Any] = {
        "sub": user_id,
        "jti": str(uuid.uuid4()),
        "exp": datetime.now(UTC) + timedelta(seconds=settings.jwt_access_ttl_seconds),
    }
    token: str = pyjwt.encode(payload, settings.jwt_secret, algorithm="HS256")  # pyright: ignore[reportUnknownMemberType]
    return token


def decode_access_token(token: str) -> dict[str, Any]:
    result: dict[str, Any] = pyjwt.decode(  # pyright: ignore[reportUnknownMemberType]
        token, settings.jwt_secret, algorithms=["HS256"]
    )
    return result
