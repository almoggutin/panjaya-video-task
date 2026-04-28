import os

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from video_audio_server.core.constants.env_constants import BASE_CORS

_environment: str = os.environ.get("ENVIRONMENT", "local")
_env_file: str = f"envs/.env.{_environment}"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_env_file,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    environment: str = "development"
    port: int = 8000
    log_level: str = "DEBUG"
    cors_whitelist: list[str] = []

    @field_validator("cors_whitelist", mode="before")
    @classmethod
    def parse_cors_whitelist(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    @model_validator(mode="after")
    def merge_cors(self) -> "Settings":
        self.cors_whitelist = list(dict.fromkeys(BASE_CORS + self.cors_whitelist))
        return self

    api_version: str = "v1"

    # Database
    database_url: str = ""

    # Redis
    redis_url: str = ""

    # Storage
    s3_endpoint_url: str | None = None
    s3_bucket: str = ""
    s3_access_key_id: str = ""
    s3_secret_access_key: str = ""

    # Auth
    jwt_secret: str = ""
    jwt_access_ttl_seconds: int = 900
    jwt_refresh_ttl_seconds: int = 604800

    # Upload
    max_upload_bytes: int = 524288000
    max_request_body_bytes: int = (
        1_048_576  # 1 MB — JSON endpoints only; videos go direct to S3
    )
    presigned_put_ttl: int = 300  # seconds — presigned PUT URL lifetime
    presigned_get_ttl: int = 900  # seconds — presigned GET URL lifetime

    # Worker
    worker_job_timeout: int = 600
    worker_max_tries: int = 3
    worker_job_secret: str = "change-me-in-production"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        return self.environment in ("development", "local")


settings = Settings()
